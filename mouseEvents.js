// mouseEvents.js

const handleMouseOver = (element) => {
    element.addEventListener('mouseover', () => {
        // Handle mouse over event
        console.log('Mouse over event occurred');
    });
};

const handleMouseOut = (element) => {
    element.addEventListener('mouseout', () => {
        // Handle mouse out event
        console.log('Mouse out event occurred');
    });
};

const handleMouseClick = (element) => {
    element.addEventListener('click', () => {
        // Handle mouse click event
        console.log('Mouse click event occurred');
    });
};

export { handleMouseOver, handleMouseOut, handleMouseClick };
