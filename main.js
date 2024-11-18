import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

// 保存初始相机位置和目标
const initialCameraPosition = camera.position.clone();
const initialTarget = new THREE.Vector3(0, 0, 0); // 假设初始目标是原点

// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 使用PMREMGenerator
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// 加载自定义地图纹理
const textureLoader = new THREE.TextureLoader();
const mapTexture = textureLoader.load('images/map1r.png', () => {
    // 创建平面几何体
    const planeGeometry = new THREE.PlaneGeometry(20, 20); // 调整平面几何体的大小
    const planeMaterial = new THREE.MeshBasicMaterial({ map: mapTexture });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    // 将平面几何体旋转90度
    plane.rotation.x = -Math.PI / 2; // 绕X轴旋转90度
    plane.position.y = 0; // 调整平面的位置，使其位于球体下方

    // 将平面几何体添加到场景中
    scene.add(plane);
});

// 创建一个透明的网格球体
const transparentWireframeGeometry = new THREE.SphereGeometry(2, 32, 32);
const transparentWireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00, // 设置为白色或其他你喜欢的颜色
    wireframe: true, // 启用网格模式
    transparent: true, // 启用透明度
    opacity: 0.5 // 设置透明度（0.0到1.0之间）
});
const transparentWireframeSphere = new THREE.Mesh(transparentWireframeGeometry, transparentWireframeMaterial);
scene.add(transparentWireframeSphere);

// 创建从原点到透明网格球体的线段
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00}); // 修改颜色
const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0), // 原点
    transparentWireframeSphere.position // 使用透明网格球体的位置
]);
const line = new THREE.Line(lineGeometry, lineMaterial);
scene.add(line);

// 创建一个放大的三棱锥
const pyramidGeometry = new THREE.ConeGeometry(1, 3, 3); // 半径为1，高度为3
const pyramidMaterial = new THREE.MeshStandardMaterial({ color: 0xFF4500, metalness: 0.5, roughness: 0.1 });
const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
pyramid.position.set(7, 2, 0); // 将三棱锥放置在网格球体的右侧，远离球体
scene.add(pyramid);

// 创建聚光灯1
const spotLight1 = new THREE.SpotLight(0xffffff);
spotLight1.position.set(5, 5, 5); // 调整光源位置
spotLight1.target = pyramid; // 将光源的目标设置为三棱锥
spotLight1.angle = Math.PI / 4; // 增大光线的锥角
scene.add(spotLight1);

// 创建聚光灯2
const spotLight2 = new THREE.SpotLight(0xffffff);
spotLight2.position.set(-5, 5, 5); // 调整光源位置
spotLight2.target = pyramid; // 将光源的目标设置为三棱锥
spotLight2.angle = Math.PI / 4; // 增大光线的锥角
scene.add(spotLight2);

// 创建一个环境光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 白色环境光，强度为0.5
scene.add(ambientLight);

// 添加OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 启用阻尼效果
controls.dampingFactor = 0.25; // 阻尼系数
controls.screenSpacePanning = false; // 禁用屏幕空间平移
controls.minPolarAngle = Math.PI / 190; // 最小垂直角度（10度）
controls.maxPolarAngle = Math.PI / 2.1; // 最大垂直角度（80度）

const compass = document.getElementById('compass');

// 加载天空球体纹理
const skyTexture = textureLoader.load('images/sky_box.ad6bafcddb73df51efb4.png', () => {
    skyTexture.wrapS = THREE.ClampToEdgeWrapping;
    skyTexture.wrapT = THREE.ClampToEdgeWrapping;
    skyTexture.minFilter = THREE.LinearMipMapLinearFilter;
    skyTexture.magFilter = THREE.LinearFilter;

    // 创建球体几何体
    const skyGeometry = new THREE.SphereGeometry(500, 60, 40);
    // 创建材质
    const skyMaterial = new THREE.MeshBasicMaterial({
        map: skyTexture,
        side: THREE.BackSide // 使纹理应用在球体内部
    });
    // 创建球体网格
    const skySphere = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skySphere);
});

// 创建一个小球体来表示原点
const originSphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const originSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const originSphere = new THREE.Mesh(originSphereGeometry, originSphereMaterial);
scene.add(originSphere);

// 创建坐标轴辅助工具
const axesHelper = new THREE.AxesHelper(5); // 参数表示坐标轴的长度
scene.add(axesHelper); // X轴：红色 Y轴：绿色 Z轴：蓝色

// 创建大门图标
const gateTexture = textureLoader.load('images/door.svg'); // 使用SVG格式的图标
const gateMaterial = new THREE.SpriteMaterial({ map: gateTexture });
const gateSprite = new THREE.Sprite(gateMaterial);
gateSprite.position.set(2, 0.3, 0); // 设置大门图标的位置
gateSprite.scale.set(0.5, 0.5, 0.5);
scene.add(gateSprite);

// 创建幼儿园图标
const kindergartenTexture = textureLoader.load('images/editor.svg'); // 使用SVG格式的图标
const kindergartenMaterial = new THREE.SpriteMaterial({ map: kindergartenTexture });
const kindergartenSprite = new THREE.Sprite(kindergartenMaterial);
kindergartenSprite.position.set(5, 0.3, 5); // 设置幼儿园图标的位置
kindergartenSprite.scale.set(0.5, 0.5, 0.5);
scene.add(kindergartenSprite);

// 创建道路
let roadLine = null;

// 添加点击事件
renderer.domElement.addEventListener('click', (event) => {
    // 计算鼠标位置
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 创建射线
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // 检测点击的对象
    const intersects = raycaster.intersectObjects([kindergartenSprite]);
    if (intersects.length > 0) {
        // 如果点击了幼儿园图标，创建或更新道路
        if (roadLine) {
            scene.remove(roadLine); // 移除旧的道路
        }
        const roadGeometry = new THREE.BufferGeometry().setFromPoints([
            gateSprite.position,
            kindergartenSprite.position
        ]);
        const roadMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
        roadLine = new THREE.Line(roadGeometry, roadMaterial);
        scene.add(roadLine);
    }
});

// 渲染循环
function animate() {
    requestAnimationFrame(animate);

    // 旋转球体和三棱锥
    transparentWireframeSphere.rotation.y += 0.01;
    pyramid.rotation.y += 0.01;
    controls.update(); // 更新控制器

    // 更新线段的位置
    line.geometry.setFromPoints([
        new THREE.Vector3(0, 0, 0), // 原点
        transparentWireframeSphere.position // 更新后的对象位置
    ]);

    // 更新指南针的旋转
    const vector = new THREE.Vector3();
    camera.getWorldDirection(vector);
    const angle = Math.atan2(vector.x, vector.z) + Math.PI; // 加上180度
    compass.style.transform = `rotate(${angle}rad)`;

    TWEEN.update(); // 更新tween动画

    renderer.render(scene, camera);
}

animate();

// 调整窗口大小时更新渲染器和相机
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 点击指南针重置视角
compass.addEventListener('click', () => {
    // 使用tween.js平滑过渡相机位置
    new TWEEN.Tween(camera.position)
        .to({ x: initialCameraPosition.x, y: initialCameraPosition.y, z: initialCameraPosition.z }, 2000) // 2秒内完成过渡
        .easing(TWEEN.Easing.Quadratic.Out) // 使用缓动函数
        .start();

    // 使用tween.js平滑过渡控件目标
    new TWEEN.Tween(controls.target)
        .to({ x: initialTarget.x, y: initialTarget.y, z: initialTarget.z }, 2000) // 2秒内完成过渡
        .easing(TWEEN.Easing.Quadratic.Out) // 使用缓动函数
        .onUpdate(() => controls.update()) // 在每次更新时调用controls.update()
        .start();
});