const fs = require('fs');
const path = 'c:/Users/ich/Desktop/code/_projects/Nodges/public/data/b6/1_SingleStep_Graph_2026-07-17T08-20-17.json';

const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Distances for the spiral, scaled down to a max of 20
data.data.entities.forEach((entity, index) => {
    let rawDistance = 0;
    if (entity.distanceToSun) {
        rawDistance = entity.distanceToSun;
    } else if (entity.label === 'SonnenSystem_1') {
        rawDistance = 0;
    } else if (entity.label === 'Kant') {
        rawDistance = 5500;
    } else {
        rawDistance = 100 * (index + 1);
    }

    // Skalierungsfaktor: 5500 / 20 = 275
    // So wird 5500 exakt zu 20
    const distance = rawDistance / 275; 
    const angle = index * (Math.PI / 3); // 60 degrees apart

    entity.position = {
        x: Math.round(Math.cos(angle) * distance * 100) / 100,
        y: Math.round(Math.sin(angle) * distance * 100) / 100,
        z: (entity.label === 'Kant') ? 5 : 0
    };
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('JSON updated successfully with max distance ~20!');
