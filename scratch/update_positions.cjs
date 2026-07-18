const fs = require('fs');
const path = 'c:/Users/ich/Desktop/code/_projects/Nodges/public/data/b6/1_SingleStep_Graph_2026-07-17T08-20-17.json';

const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Distances for the spiral:
data.data.entities.forEach((entity, index) => {
    let distance = 0;
    if (entity.distanceToSun) {
        distance = entity.distanceToSun;
    } else if (entity.label === 'SonnenSystem_1') {
        distance = 0;
    } else if (entity.label === 'Kant') {
        distance = 5500;
    } else {
        distance = 100 * (index + 1);
    }

    const angle = index * (Math.PI / 3); // 60 degrees apart

    entity.position = {
        x: Math.round(Math.cos(angle) * distance),
        y: Math.round(Math.sin(angle) * distance),
        z: (entity.label === 'Kant') ? 1000 : 0
    };
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('JSON updated successfully!');
