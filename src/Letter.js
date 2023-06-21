import * as THREE from 'three';

export default class Letter {
    constructor(points, offsetCount) {
        this.offsetCount = offsetCount;
        this.basePoints = points;
        this.baseGeometry = this.createGeometry(this.basePoints);
        this.basePointsLength = points.length;
        this.pointsNormals = this.createPointNormalList(points);
        this.geometries = this.createGeometries(this.offsetCount);

        this.colors = [new THREE.Color(0xFF00FF), new THREE.Color(0x00FFFF), new THREE.Color(0xFFFF00)];
        this.colorValue = 0;

    }

    getMaterial() {
        const increment = 1 / this.offsetCount;
        this.colorValue += increment;
        if (this.colorValue > 1) this.colorValue = 0;

        const interpolatedColor = new THREE.Color();
        if (this.colorValue > 0.5) {
            const normalizedValue = (this.colorValue - 0.5) / (1 - 0.5);
            interpolatedColor.lerpColors(this.colors[1], this.colors[2], normalizedValue);
        } else {
            const normalizedValue = (this.colorValue) / (0.5);
            interpolatedColor.lerpColors(this.colors[0], this.colors[1], normalizedValue);
        }

        return new THREE.LineBasicMaterial({ color: interpolatedColor });
    }


    calculatePointNormal(point, nextPoint) {
        const tangent = point.clone().sub(nextPoint);
        const normal = new THREE.Vector2(-tangent.y, tangent.x);
        return normal;
    }

    createPointNormalList(points) {
        const pointsNormals = [];
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const nextPoint = points[(i + 1) % (points.length - 1)]
            pointsNormals.push(this.calculatePointNormal(point, nextPoint))
        };
        return pointsNormals;
    }

    createGeometry(points) {

        const vertices = []
        for (let i = 0; i < points.length; i++) {
            vertices.push(points[i].x, points[i].y, 0)
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        return geometry;
    }

    createGeometries(offsetCount) {
        const geometries = [];

        for (let i = 0; i < offsetCount; i++) {
            const geometry = this.createGeometry(this.basePoints);
            geometries.push(geometry);
        }
        return geometries;
    }

    createOffsetGeometries(offsetCount, offsetAmount) {
        const geometries = [];
        for (let i = 0; i < offsetCount; i++) {
            const offsetedPoints = []
            for (let j = 0; j < this.basePoints.length; j++) {
                const offsetVector = this.pointsNormals[j].clone().multiplyScalar(offsetAmount * i);
                const offsetedPoint = this.basePoints[j].clone().add(offsetVector);
                // console.log(this.basePoints[j],offsetedPoint);
                // console.log(this.pointsNormals[j],offsetVector);
                offsetedPoints.push(offsetedPoint);
            }
            const geometry = this.createGeometry(offsetedPoints);
            geometries.push(geometry);
        }
        return geometries;
    }


    getMeshes() {
        const meshes = []
        this.geometries.forEach((geometry) => {
            meshes.push(new THREE.Line(geometry, this.getMaterial()));
        });

        return meshes;

    }

    update(frequencies) {
        const displacementAmplitude = [];
        for (let i = 0; i < this.offsetCount; i++) {
            displacementAmplitude.push(-3);
        }
        const smoothing = 0.05;


        const basePositions = this.baseGeometry.attributes.position;

        for (let i = 0; i < this.offsetCount; i++) {
            const positions = this.geometries[i].attributes.position;
            for (let j = 0; j < this.basePointsLength; j++) {
                const displacement = (frequencies[i][j] /255) * displacementAmplitude[i];
                // if (j==0) console.log("i:",i," freq:",frequencies[i][j]);
                let targetX, targetY;
                if (j < this.basePointsLength - 1) {
                    targetX = basePositions.getX(j) + displacement * this.pointsNormals[j].x;
                    targetY = basePositions.getY(j) + displacement * this.pointsNormals[j].y;
                } else {
                    targetX = basePositions.getX(0) + displacement * this.pointsNormals[0].x;
                    targetY = basePositions.getY(0) + displacement * this.pointsNormals[0].y;
                }

                const x = positions.getX(j) + (targetX - positions.getX(j)) * smoothing;
                const y = positions.getY(j) + (targetY - positions.getY(j)) * smoothing;

                positions.setXYZ(j, x, y, 0);
            }
            positions.needsUpdate = true;
        }

    }


}