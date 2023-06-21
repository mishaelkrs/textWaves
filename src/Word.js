import * as THREE from 'three';
import Letter from './Letter';

export default class Word {
    constructor(wordString, font, offsetCount) {
        this.offsetCount = offsetCount;
        this.wordString = wordString;
        this.word = this.createWord(wordString, font, offsetCount);
        this.pointsNum = 250;


    }

    createWord(wordString, font, offsetCount) {
        const shapes = font.generateShapes(wordString, 1.3);
        console.log(shapes);
        const letters = [];
        this.holesPoints = [];

        shapes.forEach((shape, index) => {
            // if (this.wordString[index]===" ") return;

            const letterPoints = shape.getSpacedPoints(this.pointsNum);
            const letter = new Letter(letterPoints, offsetCount)
            letters.push(letter);

            // genereate holes points
            this.holesPoints.push(shape.getPointsHoles());
        });

        return letters;
    }

    getMeshes() {
        const meshes = []
        this.word.forEach((letter) => {
            const mesh = letter.getMeshes();
            meshes.push(...mesh);
        });
        return meshes;

    }

    getHolesMeshes() {
        const meshes = []
        this.holesPoints.forEach((points) => {
            if (points.length<1) return;
            const vertices = []
            for (let i = 0; i < points[0].length; i++) {
                vertices.push(points[0][i].x, points[0][i].y, 0)
            }

            // console.log(vertices);
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            const material=new THREE.LineBasicMaterial({ color: 0xFFFF00 })
            meshes.push(new THREE.Line(geometry, material));

        })
        return meshes;
    }

    update(frequencyData) {
        // console.log(frequencyData);
        const maxFrequency = 256;
        const frequenciesAmount = Math.ceil(maxFrequency / this.offsetCount);
        const letterFrequncies = []
        for (let i = 0; i < maxFrequency; i += frequenciesAmount) {
            let frequencies = frequencyData.slice(i, i + frequenciesAmount);
            let maxVal = Math.max(...frequencies);
            let minVal = Math.min(...frequencies);
            if (minVal === maxVal) minVal = maxVal = 0;
            // console.log(i/frequenciesAmount,minVal,maxVal);

            // for (let j=0; j<frequencies.length; j++){
            //     // console.log(frequency[i]);
            //     frequencies[j]=remapNumber(frequencies[j],0,255,0,1);
            // }
            // frequencies = interpolateArray(frequencies,this.pointsNum)
            frequencies = extendArray(frequencies, this.pointsNum)
            letterFrequncies.push(frequencies);
        }
        // console.log(letterFrequncies);
        this.word.forEach((letter) => {
            letter.update(letterFrequncies);
        });

    }

}

function extendArray(data, fitCount) {
    var newData = [...data]; // create a copy of the original data
    if (fitCount > data.length) {
        newData.length = fitCount; // extend the array
        newData.fill(0, data.length); // fill the new elements with zeros
    }
    // console.log(newData);
    return newData;
};


function interpolateArray(data, fitCount) {

    var midpoint = function (before, after) {
        return (before + after) / 2;
    };

    var newData = new Array();
    var springFactor = Number((data.length - 1) / (fitCount - 1));
    newData[0] = data[0]; // for new allocation
    for (var i = 1; i < fitCount - 1; i++) {
        var tmp = i * springFactor;
        var before = Math.floor(tmp);
        var after = Math.ceil(tmp);
        newData[i] = midpoint(data[before], data[after]);
    }
    newData[fitCount - 1] = data[data.length - 1]; // for new allocation
    console.log(newData);
    return newData;
};




function remapNumber(value, sourceMin, sourceMax, targetMin, targetMax) {
    // Calculate the normalized value within the source range
    const normalizedValue = (value - sourceMin) / (sourceMax - sourceMin);

    // Map the normalized value to the target range
    const remappedValue = normalizedValue * (targetMax - targetMin) + targetMin;

    return remappedValue;
}
