const fs = require('fs');
const path = 'c:/Users/ich/Desktop/code/_projects/Nodges/public/data/b6/1_SingleStep_Graph_2026-07-17T08-20-17.json';

const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Distances for the spiral, scaled down!
// We divide distances by 50 to make them fit nicely in the 3D grid
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

    const distance = rawDistance / 50; // Skalierungsfaktor
    const angle = index * (Math.PI / 3); // 60 degrees apart

    entity.position = {
        x: Math.round(Math.cos(angle) * distance * 100) / 100,
        y: Math.round(Math.sin(angle) * distance * 100) / 100,
        z: (entity.label === 'Kant') ? 20 : 0
    };
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('JSON updated successfully with smaller dimensions!');
