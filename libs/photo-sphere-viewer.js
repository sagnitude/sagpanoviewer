/*
 * Photo Sphere Viewer v1.3
 * http://jeremyheleine.com/#photo-sphere-viewer
 *
 * Copyright (c) 2014 Jérémy Heleine
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Viewer class
 * @param args (Object) Viewer arguments
 * - panorama (string) Panorama URL or path (absolute or relative)
 * - container (HTMLElement) Panorama container (generally a div)
 * - time_anim (integer) (optional) (2000) Automatically animate the panorama after time_anim seconds, -1 to deactivate
 * - theta_offset (integer) (optional) (1440) The PI fraction to add to theta in the animation
 * - loading_img (string) (optional) (null) Loading image URL or path (absolute or relative)
 **/
var PhotoSphereViewer = function (args) {
	/**
	 * Detects whether canvas is supported
	 * @return (boolean) true if canvas is supported, false otherwise
	 **/
	var isCanvasSupported = function () {
		var canvas = document.createElement('canvas');
		return !!(canvas.getContext && canvas.getContext('2d'));
	}

	/**
	 * Detects whether WebGL is supported
	 * @return (boolean) true if WebGL is supported, false otherwise
	 **/
	var isWebGLSupported = function () {
		var canvas = document.createElement('canvas');
		return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
	}

	/**
	 * Attaches an event handler function to an elemnt
	 * @param elt (HTMLElement) The element
	 * @param evt (string) The event name
	 * @param f (Function) The handler function
	 * @return (void)
	 **/
	var attachEvent = function (elt, evt, f) {
//		if (elt.addEventListener)
//			elt.addEventListener(evt, f, false);
//		else
//			elt.attachEvent('on' + evt, f);
        Event.removeHandler(elt, evt, f);
        Event.addHandler(elt, evt, f);
	}

	/**
	 * Start loading panorama
	 * @return (void)
	 **/
	var startLoading = function () {
		// Loading indicator (text or image if given)
		if (m_loading_img != null) {
			var loading = document.createElement('img');
			loading.setAttribute('src', m_loading_img);
			loading.setAttribute('alt', 'Loading...');
			m_container.appendChild(loading);
		}
		else
			m_container.textContent = 'Loading...';

		// Is canvas supported?
		if (!isCanvasSupported()) {
			m_container.textContent = 'Canvas is not supported, update your browser!';
			return;
		}

		// Is Three.js loaded?
		if (window.THREE === undefined) {
			console.log('PhotoSphereViewer: Three.js is not loaded.');
			return;
		}

		// Container size
		m_width = m_container.offsetWidth;
		m_height = m_container.offsetHeight;
		m_ratio = m_width / m_height;

		// EXIF data
		loadEXIF();
	}

	/**
	 * Returns the value of a given attribute in the panorama metadata
	 * @param data (string) The panorama metadata
	 * @param attr (string) The wanted attribute
	 * @return (string) The value of the attribute
	 **/
	var getAttribute = function (data, attr) {
		var a = data.indexOf('GPano:' + attr) + attr.length + 8, b = data.indexOf('"', a);
		return data.substring(a, b);
	}

	/**
	 * Loads the EXIF data with AJAX
	 * @return (void)
	 **/
	var loadEXIF = function () {
		//var xhr = null;
		//if (window.XMLHttpRequest)
		//	xhr = new XMLHttpRequest();
		//else if (window.ActiveXObject) {
		//	try {
		//		xhr = new ActiveXObject('Msxml2.XMLHTTP');
		//	}
		//	catch (e) {
		//		xhr = new ActiveXObject('Microsoft.XMLHTTP');
		//	}
		//}
		//else {
		//	m_container.textContent = 'XHR is not supported, update your browser!';
		//	return;
		//}
		//
		//xhr.onreadystatechange = function() {
		//		if (xhr.readyState == 4 && xhr.status == 200) {
		//			// Metadata
		//			var binary = xhr.responseText;
		//			var a = binary.indexOf('<x:xmpmeta'), b = binary.indexOf('</x:xmpmeta>');
		//
		//			// No data retrieved
		//			if (a == -1 || b == -1) {
		//				m_container.textContent = 'This is not a Photo Sphere panorama!';
		//				return;
		//			}
		//
		//			// Useful values
		//			var data = binary.substring(a, b);
		//			var full_width = parseInt(getAttribute(data, 'FullPanoWidthPixels'));
		//			var full_height = parseInt(getAttribute(data, 'FullPanoHeightPixels'));
		//			var cropped_width = parseInt(getAttribute(data, 'CroppedAreaImageWidthPixels'));
		//			var cropped_height = parseInt(getAttribute(data, 'CroppedAreaImageHeightPixels'));
		//			var cropped_x = parseInt(getAttribute(data, 'CroppedAreaLeftPixels'));
		//			var cropped_y = parseInt(getAttribute(data, 'CroppedAreaTopPixels'));
		//
		//			//HACK
		//			full_width = 2048;
		//			full_height = 1024;
		//			cropped_width = 2048;
		//			cropped_height = 1024;
		//			cropped_x = 0;
		//			cropped_y = 0;
		//
		//			createBuffer(full_width, full_height, cropped_width, cropped_height, cropped_x, cropped_y);
		//		}
		//	};
		//
		//xhr.open('GET', m_panorama, true);
		//xhr.send(null);

		var full_width = 2048;
		var full_height = 1024;
		var cropped_width = 2048;
		var cropped_height = 1024;
		var cropped_x = 0;
		var cropped_y = 0;

		createBuffer(full_width, full_height, cropped_width, cropped_height, cropped_x, cropped_y);

	}

	/**
	 * Creates an image in the right dimensions
	 * @return (void)
	 **/
	var createBuffer = function (full_width, full_height, cropped_width, cropped_height, cropped_x, cropped_y) {
		var img = new Image();

		img.onload = function () {
			// Resize image for mobile compatibility
//			var max_width = 2048;
//			if (isWebGLSupported()) {
//				var canvas = document.createElement('canvas');
//				var ctx = canvas.getContext('webgl');
//				max_width = ctx.getParameter(ctx.MAX_TEXTURE_SIZE);
//			}
//
//			var new_width = Math.min(full_width, max_width);
//			var r = new_width / full_width;
//			full_width = new_width;
//			cropped_width *= r;
//			cropped_x *= r;
//			img.width = cropped_width;
//
//			full_height *= r;
//			cropped_height *= r;
//			cropped_y *= r;
//			img.height = cropped_height;

			var buffer = document.createElement('canvas');
			buffer.width = full_width;
			buffer.height = full_height;
			var ctx = buffer.getContext('2d');

			ctx.drawImage(img, cropped_x, cropped_y, cropped_width, cropped_height);
			loadTexture(buffer.toDataURL('image/png'));
		};

		img.src = m_panorama;
		img.crossOrigin = "anonymous";
		//img.src = m_src_url;
	}

	/**
	 * Loads the sphere texture
	 * @param path (URL) Path to the panorama
	 * @return (void)
	 **/
	var loadTexture = function (path) {
		var texture = new THREE.Texture();
		var loader = new THREE.ImageLoader();

		var onLoad = function (img) {
			texture.needsUpdate = true;
			texture.image = img;
			createScene(texture);
		}
		loader.load(path, onLoad);
	}

	/**
	 * Creates the 3D scene
	 * @param texture (THREE.Texture) The sphere texture
	 * @return (void)
	 **/
	var createScene = function (texture) {
		// The chosen renderer depends on if WebGL is supported or not
		window.trenderer = m_renderer = window.trenderer || ((isWebGLSupported()) ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer());
		m_renderer.setSize(m_width, m_height);

		m_scene = new THREE.Scene();

        var interangle = -displayingPofs.fullShot.interAngle * Math.PI / 180;

		window.tcamera = m_camera = window.tcamera || new THREE.PerspectiveCamera(m_fov, m_ratio, 1, 300);
		window.tphi = window.tphi || 0;
		window.ttheta = window.ttheta || 0;
		m_camera.position.set(0, 0, 0);
		m_scene.add(m_camera);

		// Sphere
		var geometry = new THREE.SphereGeometry(200, 32, 32);
		var material = new THREE.MeshBasicMaterial({map: texture, overdraw: true});
		var mesh = new THREE.Mesh(geometry, material);
		mesh.scale.x = -1;
        mesh.rotateY(interangle + Math.PI / 2);
		m_scene.add(mesh);

		//lines
		//var op = m_curves.op;
		//var shape = m_curves.shape;
		//.LLLLLL...............OOOOOOO...........AAAAA.......DDDDDDDDDDD.....
		//.LLLLLL.............OOOOOOOOOOO........AAAAAAA......DDDDDDDDDDDDD...
		//.LLLLLL............OOOOOOOOOOOOO.......AAAAAAA......DDDDDDDDDDDDDD..
		//.LLLLLL............OOOOO...OOOOO......AAAAAAAAA.....DDDDD...DDDDDDD.
		//.LLLLLL...........OOOOO.....OOOOO.....AAAAAAAAA.....DDDDD....DDDDDD.
		//.LLLLLL...........OOOOO.....OOOOO.....AAAAAAAAA.....DDDDD....DDDDDD.
		//.LLLLLL...........OOOOO.....OOOOO....AAAA...AAAA....DDDDD.....DDDDD.
		//.LLLLLL...........OOOOO.....OOOOO....AAAA...AAAA....DDDDD.....DDDDD.
		//.LLLLLL...........OOOOO.....OOOOO....AAAAAAAAAAA....DDDDD....DDDDDD.
		//.LLLLLL...........OOOOO.....OOOOO...AAAAAAAAAAAAA...DDDDD....DDDDDD.
		//.LLLLLL............OOOOO...OOOOO....AAAAAAAAAAAAA...DDDDD...DDDDDD..
		//.LLLLLLLLLLLLLLL...OOOOOOOOOOOOO....AAAA.....AAAA...DDDDDDDDDDDDDD..
		//.LLLLLLLLLLLLLLL....OOOOOOOOOOO....AAAAA.....AAAAA..DDDDDDDDDDDDD...
		//.LLLLLLLLLLLLLLL......OOOOOOO......AAAA.......AAAA..DDDDDDDDDDD.....
		sceneArrow = new THREE.Scene();
		sceneArrow.add(new THREE.AmbientLight(0x7f7f7f));
		var light1 = new THREE.DirectionalLight(0xffffff, 0.5);
		light1.position.set(1, 1, 1);
		sceneArrow.add(light1);


		sceneSprite = new THREE.Scene();
		var circleTexture = THREE.ImageUtils.loadTexture('imgs/circle.png', THREE.UVMapping, function () {
			render();
		});

		{
			var pofsList = m_curves.editParts;

			for (var pi in pofsList) {
				var shape = pofsList[pi].shape;
				var minX = 100, maxX = -100, minY = 100, maxY = -100;
				for (var i = 0; i < shape.length; i += 2) {
					var x = shape[i + 0], y = shape[i + 1];
					if (x > maxX) maxX = x;
					if (x < minX) minX = x;
					if (y > maxY) maxY = y;
					if (y < minY) minY = y;
				}
				var midX = (minX + maxX) / 2, midY = (minY + maxY) / 2;
                midX -= interangle + Math.PI / 2;
				midY = Math.PI / 2 - midY;
				const spriteR = 150;
				var spriteX = spriteR * Math.cos(midY) * Math.cos(midX);
				var spriteY = spriteR * Math.sin(midY);
				var spriteZ = spriteR * Math.cos(midY) * Math.sin(midX);

				var circleMaterial = new THREE.SpriteMaterial({
					map: circleTexture,
					useScreenCoordinates: false,
					color: 0xffffff
				});
				var spriteObject = new THREE.Sprite(circleMaterial);
				spriteObject.position.set(spriteX, spriteY, spriteZ);
				spriteObject.scale.set(8, 8, 1.0);
				sceneSprite.add(spriteObject);
			}
		}

		{
			var arrowPosition = [
				[2, 0, 0], [0, 0, 2], [0, 0, 1], [-2, 0, 1], [-2, 0, 0], [-2, 0, 0], [-2, 0, -1], [0, 0, -1], [0, 0, -2], [2, 0, 0],
				[2, 1.5, 0], [0, 1.0, 2], [0, 1.25, 1], [-2, 1.25, 1], [-2, 1.5, 0], [-2, 1.5, 0], [-2, 1.25, -1], [0, 1.25, -1], [0, 1, -2], [2, 1.5, 0],

				[2, 0, 0], [0, 0, 2], [2, 1.5, 0], [0, 1.0, 2],
				[0, 0, 2], [0, 0, 1], [0, 1.0, 2], [0, 1.25, 1],
				[0, 0, 1], [-2, 0, 1], [0, 1.25, 1], [-2, 1.25, 1],
				[-2, 0, 1], [-2, 0, 0], [-2, 1.25, 1], [-2, 1.5, 0],
				[-2, 0, 0], [-2, 0, -1], [-2, 1.5, 0], [-2, 1.25, -1],
				[-2, 0, -1], [0, 0, -1], [-2, 1.25, -1], [0, 1.25, -1],
				[0, 0, -1], [0, 0, -2], [0, 1.25, -1], [0, 1.0, -2],
				[0, 0, -2], [2, 0, 0], [0, 1.0, -2], [2, 1.5, 0]
			];

			var arrowNormal = [
				[0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0],
				[0, 0.9701, 0.2425], [0, 0.9701, 0.2425], [0, 0.9701, 0.2425], [0, 0.9701, 0.2425], [0, 0.9701, 0.2425],
				[0, 0.9701, -0.2425], [0, 0.9701, -0.2425], [0, 0.9701, -0.2425], [0, 0.9701, -0.2425], [0, 0.9701, -0.2425],

				[0.707, 0, 0.707], [0.707, 0, 0.707], [0.707, 0, 0.707], [0.707, 0, 0.707],
				[-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0],
				[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1],
				[-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0],
				[-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0],
				[0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1],
				[-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0],
				[0.707, 0, -0.707], [0.707, 0, -0.707], [0.707, 0, -0.707], [0.707, 0, -0.707]
			];

			var arrowIndex = [
				[0, 2, 1], [0, 4, 2], [2, 4, 3], [9, 7, 5], [5, 7, 6], [9, 8, 7],
				[10, 12, 11], [10, 14, 12], [12, 14, 13], [19, 17, 15], [15, 17, 16], [19, 18, 17],

				[20, 23, 21], [20, 22, 23],
				[24, 27, 25], [24, 26, 27],
				[28, 31, 29], [28, 30, 31],
				[32, 35, 33], [32, 34, 35],
				[36, 39, 37], [36, 38, 39],
				[40, 43, 41], [40, 42, 43],
				[44, 47, 45], [44, 46, 47],
				[48, 51, 49], [48, 50, 51]
			];

			var vertexCount = 52, triangleCount = 28;

			var arrowGeometry = new THREE.BufferGeometry();

			var positionArray = new Float32Array(vertexCount * 3);
			var normalsArray = new Float32Array(vertexCount * 3);
			var indexArray = new Uint16Array(triangleCount * 3);

			for (var v = 0; v < vertexCount; v++) {
				positionArray[v * 3 + 0] = arrowPosition[v][0];
				positionArray[v * 3 + 1] = arrowPosition[v][1];
				positionArray[v * 3 + 2] = arrowPosition[v][2];
				normalsArray[v * 3 + 0] = arrowNormal[v][0];
				normalsArray[v * 3 + 1] = arrowNormal[v][1];
				normalsArray[v * 3 + 2] = arrowNormal[v][2];
			}
			for (var t = 0; t < triangleCount; t++) {
				indexArray[t * 3 + 0] = arrowIndex[t][0];
				indexArray[t * 3 + 1] = arrowIndex[t][1];
				indexArray[t * 3 + 2] = arrowIndex[t][2];
			}

			arrowGeometry.addAttribute('position', new THREE.BufferAttribute(positionArray, 3));
			arrowGeometry.addAttribute('normal', new THREE.BufferAttribute(normalsArray, 3));
			arrowGeometry.addAttribute('index', new THREE.BufferAttribute(indexArray, 1));

			var mmm = new THREE.MeshPhongMaterial({
				color: 0xFF47A3, ambient: 0xFF47A3, specular: 0xFF47A3, shininess: 250,
				side: THREE.DoubleSide
			});

			for (var dd in m_adjacents) {
				var alpha = Math.PI + m_adjacents[dd];

				var arrowMesh = new THREE.Mesh(arrowGeometry, mmm);
				arrowMesh.targetArrowId = dd;

				arrowMesh.position.set(100 * Math.cos(alpha), -50, 100 * Math.sin(alpha));
				arrowMesh.rotateY(-alpha);
				arrowMesh.scale.set(10, 10, 10);
				sceneArrow.add(arrowMesh);
			}

		}


		// Adding events
		attachEvent(window, 'resize', onResize);
		attachEvent(m_container, 'mousedown', onMouseDown);
		attachEvent(m_container, 'touchstart', onTouchStart);
		attachEvent(document, 'mouseup', onMouseUp);
		attachEvent(document, 'touchend', onMouseUp);
		attachEvent(document, 'mousemove', onMouseMove);
		attachEvent(document, 'touchmove', onTouchMove);
		attachEvent(m_container, 'mousewheel', onMouseWheel);
		attachEvent(m_container, 'DOMMouseScroll', onMouseWheel);

		// First render
		m_container.innerHTML = '';
		m_container.appendChild(m_renderer.domElement);
		render();

		// Animation?
		anim();
	}

	/**
	 * Resize the canvas when the window is resized
	 * @return (void)
	 **/
	var onResize = function () {
		if (m_container.offsetWidth != m_width || m_container.offsetHeight != m_height) {
			m_width = m_container.offsetWidth;
			m_height = m_container.offsetHeight;
			m_ratio = m_width / m_height;

			m_camera.aspect = m_ratio;
			m_camera.updateProjectionMatrix();

			m_renderer.setSize(m_width, m_height);
		}
	}

	/**
	 * The user wants to move
	 * @param evt (Event) The event
	 * @return (void)
	 **/
	var onMouseDown = function (evt) {
		evt.preventDefault();
		startMove(parseInt(evt.clientX), parseInt(evt.clientY));

		mouseX = ( event.offsetX / m_renderer.domElement.clientWidth ) * 2 - 1;
		mouseY = -( event.offsetY / m_renderer.domElement.clientHeight ) * 2 + 1;
		click();
	}

	/**
	 * The user wants to move (mobile version)
	 * @param evt (Event) The event
	 * @return (void)
	 **/
	var onTouchStart = function (evt) {
		var touch = evt.changedTouches[0];
		if (touch.target.parentNode == m_container) {
			evt.preventDefault();
			startMove(parseInt(touch.clientX), parseInt(touch.clientY));
		}
	}

	/**
	 * Initializes the movement
	 * @param x (integer) Horizontal coordinate
	 * @param y (integer) Vertical coordinate
	 * @return (void)
	 **/
	var startMove = function (x, y) {
		m_mouse_x = x;
		m_mouse_y = y;
		clearTimeout(m_timeout);
		m_mousedown = true;
	}

	/**
	 * The user wants to stop moving
	 * @param evt (Event) The event
	 * @return (void)
	 **/
	var onMouseUp = function (evt) {
		evt.preventDefault();
		m_mousedown = false;
		anim();
	}

	//.MMMMM.....MMMMM......OOOOOOO......VVVVV.....VVVVV..EEEEEEEEEEEEEEE.
	//.MMMMM.....MMMMM....OOOOOOOOOOO....VVVVV.....VVVVV..EEEEEEEEEEEEEEE.
	//.MMMMMM...MMMMMM...OOOOOOOOOOOOO...VVVVVV...VVVVVV..EEEEEEEEEEEEEEE.
	//.MMMMMM...MMMMMM...OOOOO...OOOOO....VVVVV...VVVVV...EEEEE...........
	//.MMMMMMM.MMMMMMM..OOOOO.....OOOOO...VVVVV...VVVVV...EEEEE...........
	//.MMMMMMM.MMMMMMM..OOOOO.....OOOOO...VVVVVV.VVVVVV...EEEEEEEEEEEEEEE.
	//.MMMMMMMMMMMMMMM..OOOOO.....OOOOO....VVVVV.VVVVV....EEEEEEEEEEEEEEE.
	//.MMM.MMMMMMM.MMM..OOOOO.....OOOOO....VVVVV.VVVVV....EEEEEEEEEEEEEEE.
	//.MMM.MMMMMMM.MMM..OOOOO.....OOOOO....VVVVVVVVVVV....EEEEE...........
	//.MMM..MMMMM..MMM..OOOOO.....OOOOO.....VVVVVVVVV.....EEEEE...........
	//.MMM..MMMMM..MMM...OOOOO...OOOOO......VVVVVVVVV.....EEEEE...........
	//.MMM...MMM...MMM...OOOOOOOOOOOOO......VVVVVVVVV.....EEEEEEEEEEEEEEE.
	//.MMM...MMM...MMM....OOOOOOOOOOO........VVVVVVV......EEEEEEEEEEEEEEE.
	//.MMM....M....MMM......OOOOOOO..........VVVVVVV......EEEEEEEEEEEEEEE.
	/**
	 * The user moves the image
	 * @param evt (Event) The event
	 * @return (void)
	 **/
	var onMouseMove = function (evt) {
		evt.preventDefault();
		move(parseInt(evt.clientX), parseInt(evt.clientY));

		mouseX = ( event.offsetX / m_renderer.domElement.clientWidth ) * 2 - 1;
		mouseY = -( event.offsetY / m_renderer.domElement.clientHeight ) * 2 + 1;
	}

	/**
	 * The user moves the image (mobile version)
	 * @param evt (Event) The event
	 * @return (void)
	 **/
	var onTouchMove = function (evt) {
		var touch = evt.changedTouches[0];
		if (touch.target.parentNode == m_container) {
			evt.preventDefault();
			move(parseInt(touch.clientX), parseInt(touch.clientY));

			mouseX = ( event.offsetX / m_renderer.domElement.clientWidth ) * 2 - 1;
			mouseY = -( event.offsetY / m_renderer.domElement.clientHeight ) * 2 + 1;
		}
	}

	/**
	 * Movement
	 * @param x (integer) Horizontal coordinate
	 * @param y (integer) Vertical coordinate
	 * @return (void)
	 **/
	var move = function (x, y) {
		if (m_mousedown) {
			window.ttheta += (x - m_mouse_x) * Math.PI / 360.0;
			window.ttheta -= Math.floor(window.ttheta / (2.0 * Math.PI)) * 2.0 * Math.PI;
			window.tphi += (y - m_mouse_y) * Math.PI / 180.0;
			window.tphi = Math.min(Math.PI / 2.0, Math.max(-Math.PI / 2.0, window.tphi));

			m_mouse_x = x;
			m_mouse_y = y;
			render();
		}
	}

	/**
	 * The user wants to zoom
	 * @param evt (Event) The event
	 * @return (void)
	 **/
	var onMouseWheel = function (evt) {
		var delta = (evt.detail) ? -evt.detail : evt.wheelDelta;
		if (delta != 0) {
			var direction = parseInt(delta / Math.abs(delta));
			m_fov -= direction;
			m_fov = Math.min(90, Math.max(30, m_fov));

			m_camera.fov = m_fov;
			m_camera.updateProjectionMatrix();
			render();
		}
	}

	//.RRRRRRRRRRRR.....EEEEEEEEEEEEEEE..NNNNNN....NNNNN..DDDDDDDDDDD......EEEEEEEEEEEEEEE..RRRRRRRRRRRR....
	//.RRRRRRRRRRRRR....EEEEEEEEEEEEEEE..NNNNNN....NNNNN..DDDDDDDDDDDDD....EEEEEEEEEEEEEEE..RRRRRRRRRRRRR...
	//.RRRRRRRRRRRRRR...EEEEEEEEEEEEEEE..NNNNNNN...NNNNN..DDDDDDDDDDDDDD...EEEEEEEEEEEEEEE..RRRRRRRRRRRRRR..
	//.RRRRR...RRRRRR...EEEEE............NNNNNNNN..NNNNN..DDDDD...DDDDDDD..EEEEE............RRRRR...RRRRRR..
	//.RRRRR...RRRRRR...EEEEE............NNNNNNNN..NNNNN..DDDDD....DDDDDD..EEEEE............RRRRR...RRRRRR..
	//.RRRRR...RRRRRR...EEEEEEEEEEEEEEE..NNNNNNNNN.NNNNN..DDDDD....DDDDDD..EEEEEEEEEEEEEEE..RRRRR...RRRRRR..
	//.RRRRRRRRRRRRR....EEEEEEEEEEEEEEE..NNNNNNNNN.NNNNN..DDDDD.....DDDDD..EEEEEEEEEEEEEEE..RRRRRRRRRRRRR...
	//.RRRRRRRRRRRR.....EEEEEEEEEEEEEEE..NNNNN.NNNNNNNNN..DDDDD.....DDDDD..EEEEEEEEEEEEEEE..RRRRRRRRRRRR....
	//.RRRRR.RRRRRR.....EEEEE............NNNNN.NNNNNNNNN..DDDDD....DDDDDD..EEEEE............RRRRR.RRRRRR....
	//.RRRRR..RRRRRR....EEEEE............NNNNN..NNNNNNNN..DDDDD....DDDDDD..EEEEE............RRRRR..RRRRRR...
	//.RRRRR..RRRRRR....EEEEE............NNNNN..NNNNNNNN..DDDDD...DDDDDD...EEEEE............RRRRR..RRRRRR...
	//.RRRRR...RRRRRR...EEEEEEEEEEEEEEE..NNNNN...NNNNNNN..DDDDDDDDDDDDDD...EEEEEEEEEEEEEEE..RRRRR...RRRRRR..
	//.RRRRR....RRRRRR..EEEEEEEEEEEEEEE..NNNNN....NNNNNN..DDDDDDDDDDDDD....EEEEEEEEEEEEEEE..RRRRR....RRRRRR.
	//.RRRRR.....RRRRR..EEEEEEEEEEEEEEE..NNNNN....NNNNNN..DDDDDDDDDDD......EEEEEEEEEEEEEEE..RRRRR.....RRRRR.
	/**
	 * Renders an image
	 * @return (void)
	 **/
	var render = function () {
		var point = new THREE.Vector3();
		point.setX(Math.cos(window.tphi) * Math.sin(window.ttheta));
		point.setY(Math.sin(window.tphi));
		point.setZ(Math.cos(window.tphi) * Math.cos(window.ttheta));

		m_renderer.autoClear = false;
		m_renderer.clear();
		m_camera.lookAt(point);
		m_renderer.render(m_scene, m_camera);
		if (sceneSprite) m_renderer.render(sceneSprite, m_camera);
		if (sceneArrow) m_renderer.render(sceneArrow, m_camera);
	}

	/**
	 * Automatically animates the panorama
	 * @return (void)
	 **/
	var anim = function () {
		if (m_anim !== false && hasAnime) {
			clearTimeout(m_timeout);
			m_timeout = setTimeout(rotate, m_anim);
		}
	}

	/**
	 * Rotates the panorama
	 * @return (void)
	 **/
	var rotate = function () {
		// Returns to the equator
		window.tphi -= window.tphi / 200;

		// Rotates the sphere
		window.ttheta += window.ttheta_offset;
		window.ttheta -= Math.floor(window.ttheta / (2.0 * Math.PI)) * 2.0 * Math.PI;

		render();
		m_timeout = setTimeout(rotate, PSV_ANIM_TIMEOUT);
	}

	/**
	 * Sets the animation speed
	 * @param speed (string) The speed, in radians/degrees/revolutions per second/minute
	 * @return (void)
	 **/
	var setAnimSpeed = function (speed) {
		speed = speed.toString().trim();

		// Speed extraction
		var speed_value = parseFloat(speed.replace(/^([0-9-]+(?:\.[0-9]*)?).*$/, '$1'));
		var speed_unit = speed.replace(/^[0-9-]+(?:\.[0-9]*)?(.*)$/, '$1').trim();

		// "per minute" -> "per second"
		if (speed_unit.match(/(pm|per minute)$/))
			speed_value /= 60;

		var rad_per_second = 0;

		// Which unit?
		switch (speed_unit) {
			// Revolutions per minute / second
			case 'rpm':
			case 'rev per minute':
			case 'revolutions per minute':
			case 'rps':
			case 'rev per second':
			case 'revolutions per second':
				// speed * 2pi
				rad_per_second = speed_value * 2 * Math.PI;
				break;

			// Degrees per minute / second
			case 'dpm':
			case 'deg per minute':
			case 'degrees per minute':
			case 'dps':
			case 'deg per second':
			case 'degrees per second':
				// Degrees to radians (rad = deg * pi / 180)
				rad_per_second = speed_value * Math.PI / 180;
				break;

			// Radians per minute / second
			case 'rad per minute':
			case 'radians per minute':
			case 'rad per second':
			case 'radians per second':
				rad_per_second = speed_value;
				break;

			// Unknown unit
			default:
				m_anim = false;
		}

		// Theta offset
		m_theta_offset = rad_per_second * PSV_ANIM_TIMEOUT / 1000;
	}

	// Required parameters
	if (args === undefined || args.panorama === undefined || args.container === undefined) {
		console.log('PhotoSphereViewer: no value given for panorama or container');
		return;
	}

	// Constants
	var PSV_FRAMES_PER_SECOND = 60;
	var PSV_ANIM_TIMEOUT = 1000 / PSV_FRAMES_PER_SECOND;

	// URL to the panorama
	var m_panorama = args.panorama;

	var m_src_url = args.src;

	var m_curves = args.curves;

	var m_adjacents = args.adjacents;

	var m_jumpCallBack = args.onJumpCallBack;

	// Container of the panorama
	var m_container = args.container;

	// Do Anime Or Not
	var hasAnime = args.anime;

	// Delay before the animation
	var m_anim = 2000;
	if (args.time_anim !== undefined) {
		if (typeof args.time_anim == 'number' && args.time_anim >= 0)
			m_anim = args.time_anim;

		else
			m_anim = false;
	}

	// Deprecated: horizontal offset for the animation
	var m_theta_offset = (args.theta_offset !== undefined) ? Math.PI / parseInt(args.theta_offset) : Math.PI / 1440;

	// Horizontal animation speed
	if (args.anim_speed !== undefined)
		setAnimSpeed(args.anim_speed);
	else
		setAnimSpeed('2rpm');

	// Loading image
	var m_loading_img = (args.loading_img !== undefined) ? args.loading_img : null;

	// Some useful attributes
	var m_width, m_height, m_ratio;
	var m_renderer, m_scene, m_camera;
	var m_fov = 60;
	var m_mousedown = false, m_mouse_x = 0, m_mouse_y = 0;
	var m_timeout = null;

	startLoading();

	//....SSSSSSSSSSS.......CCCCCCCCC....EEEEEEEEEEEEEEE..NNNNNN....NNNNN..EEEEEEEEEEEEEEE.
	//..SSSSSSSSSSSSSS.....CCCCCCCCCCC...EEEEEEEEEEEEEEE..NNNNNN....NNNNN..EEEEEEEEEEEEEEE.
	//.SSSSSSSSSSSSSSS....CCCCCCCCCCCCC..EEEEEEEEEEEEEEE..NNNNNNN...NNNNN..EEEEEEEEEEEEEEE.
	//.SSSSSSS....SSSS...CCCCCC...CCCCC..EEEEE............NNNNNNNN..NNNNN..EEEEE...........
	//.SSSSSSS..........CCCCC......CCCC..EEEEE............NNNNNNNN..NNNNN..EEEEE...........
	//..SSSSSSS.........CCCCC............EEEEEEEEEEEEEEE..NNNNNNNNN.NNNNN..EEEEEEEEEEEEEEE.
	//...SSSSSSSS.......CCCCC............EEEEEEEEEEEEEEE..NNNNNNNNN.NNNNN..EEEEEEEEEEEEEEE.
	//.....SSSSSSSS.....CCCCC............EEEEEEEEEEEEEEE..NNNNN.NNNNNNNNN..EEEEEEEEEEEEEEE.
	//.......SSSSSSS....CCCCC............EEEEE............NNNNN.NNNNNNNNN..EEEEE...........
	//........SSSSSSS...CCCCC......CCCC..EEEEE............NNNNN..NNNNNNNN..EEEEE...........
	//.SSSS....SSSSSSS...CCCCCC...CCCCC..EEEEE............NNNNN..NNNNNNNN..EEEEE...........
	//.SSSSSSSSSSSSSSS....CCCCCCCCCCCCC..EEEEEEEEEEEEEEE..NNNNN...NNNNNNN..EEEEEEEEEEEEEEE.
	//.SSSSSSSSSSSSSS......CCCCCCCCCCC...EEEEEEEEEEEEEEE..NNNNN....NNNNNN..EEEEEEEEEEEEEEE.
	//..SSSSSSSSSSS.........CCCCCCCCC....EEEEEEEEEEEEEEE..NNNNN....NNNNNN..EEEEEEEEEEEEEEE.
	var sceneSprite, sceneTooltip, sceneArrow;
	var selectedSprite;
	var tooltipCanvas, tooltipContext, tooltipTexture, tooltipSprite;
	var mouseX, mouseY;

	var click = function () {
		var vector = new THREE.Vector3(mouseX, mouseY, 1);
		vector.unproject(m_camera);
		var ray = new THREE.Raycaster(m_camera.position, vector.sub(m_camera.position).normalize());

		{
			var spriteIntersects = ray.intersectObjects(sceneSprite.children);

			if (spriteIntersects.length > 0) {
				if (spriteIntersects[0].object != selectedSprite) {
					if (selectedSprite)
						selectedSprite.material.color.setHex(selectedSprite.currentHex);
					selectedSprite = spriteIntersects[0].object;
					selectedSprite.currentHex = selectedSprite.material.color.getHex();
					selectedSprite.material.color.setHex(0x00ff00);
				}
			} else {
				if (selectedSprite)
					selectedSprite.material.color.setHex(selectedSprite.currentHex);
				selectedSprite = null;
			}
		}

		{
			var arrowIntersects = ray.intersectObjects(sceneArrow.children);

			if (arrowIntersects.length > 0) {
				if (arrowIntersects[0].object.hasOwnProperty("targetArrowId")) {
					console.log("jump to " + arrowIntersects[0].object.targetArrowId);
					m_jumpCallBack(arrowIntersects[0].object.targetArrowId);
				}
			}
		}

		render();
	}
}
