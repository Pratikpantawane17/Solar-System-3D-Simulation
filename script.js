const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add stars
    function addStars(count) {
      const starGeometry = new THREE.BufferGeometry();
      const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
      const starVertices = [];
      for (let i = 0; i < count; i++) {
        const x = THREE.MathUtils.randFloatSpread(600);
        const y = THREE.MathUtils.randFloatSpread(600);
        const z = THREE.MathUtils.randFloatSpread(600);
        starVertices.push(x, y, z);
      }
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);
    }
    addStars(1000);

    const light = new THREE.PointLight(0xffffff, 1.5);
    light.position.set(0, 0, 0);
    scene.add(light);

    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFDB813 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const planetData = [
      { name: 'Mercury', color: 0xb1b1b1, radius: 0.4, distance: 4, speed: 0.04 },
      { name: 'Venus', color: 0xe6e2af, radius: 0.6, distance: 6, speed: 0.03 },
      { name: 'Earth', color: 0x2a9df4, radius: 0.65, distance: 8, speed: 0.025 },
      { name: 'Mars', color: 0xb22222, radius: 0.5, distance: 10, speed: 0.02 },
      { name: 'Jupiter', color: 0xd2b48c, radius: 1.2, distance: 14, speed: 0.015 },
      { name: 'Saturn', color: 0xf5deb3, radius: 1.1, distance: 18, speed: 0.01 },
      { name: 'Uranus', color: 0xadd8e6, radius: 0.9, distance: 22, speed: 0.008 },
      { name: 'Neptune', color: 0x4169e1, radius: 0.85, distance: 26, speed: 0.006 }
    ];

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const tooltip = document.getElementById('tooltip');
    let INTERSECTED;

    const planets = [];
    const angles = {};
    const controlsDiv = document.getElementById('controls');

    planetData.forEach(data => {
      const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color: data.color });
      const planet = new THREE.Mesh(geometry, material);
      planet.name = data.name;
      scene.add(planet);
      planets.push({ mesh: planet, distance: data.distance, speed: data.speed, name: data.name });
      angles[data.name] = 0;

      const label = document.createElement('label');
      label.textContent = `${data.name} Speed:`;
      const input = document.createElement('input');
      input.type = 'range';
      input.min = 0.001;
      input.max = 0.1;
      input.step = 0.001;
      input.value = data.speed;
      input.classList.add('slider');
      input.addEventListener('input', e => {
        const planet = planets.find(p => p.name === data.name);
        if (planet) planet.speed = parseFloat(e.target.value);
      });
      controlsDiv.appendChild(label);
      controlsDiv.appendChild(document.createElement('br'));
      controlsDiv.appendChild(input);
      controlsDiv.appendChild(document.createElement('br'));
    });

    // Pause/Resume & Theme Toggle Buttons
    const buttonDiv = document.createElement('div');
    buttonDiv.id = 'buttons';
    const pauseBtn = document.createElement('button');
    pauseBtn.textContent = 'Pause';
    const themeBtn = document.createElement('button');
    themeBtn.textContent = 'Toggle Theme';
    buttonDiv.appendChild(pauseBtn);
    buttonDiv.appendChild(themeBtn);
    controlsDiv.appendChild(buttonDiv);

    let paused = false;
    pauseBtn.addEventListener('click', () => {
      paused = !paused;
      pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    });

    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
    });

    camera.position.z = 40;
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (!paused) {
        planets.forEach(p => {
          angles[p.name] += p.speed * delta * 60;
          p.mesh.position.x = p.distance * Math.cos(angles[p.name]);
          p.mesh.position.z = p.distance * Math.sin(angles[p.name]);
        });
      }

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
      if (intersects.length > 0) {
        INTERSECTED = intersects[0].object;
        tooltip.style.display = 'block';
        tooltip.innerHTML = INTERSECTED.name;
        tooltip.style.left = (event.clientX + 10) + 'px';
        tooltip.style.top = (event.clientY + 10) + 'px';
      } else {
        tooltip.style.display = 'none';
      }

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Mouse Move for Tooltip
    document.addEventListener('mousemove', event => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Camera zoom on click
    document.addEventListener('click', () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
      if (intersects.length > 0) {
        const target = intersects[0].object;
        camera.position.set(target.position.x + 4, target.position.y + 4, target.position.z + 4);
        camera.lookAt(target.position);
      }
    });