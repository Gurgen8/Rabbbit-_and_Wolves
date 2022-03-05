//controls
document.addEventListener(
    'keydown', e => {
        appearedRabbit(e.keyCode);
        appearedWolfs();

    }
)

//configuration
const gameStatus = document.querySelector('.gameStatus');
const statusText = document.getElementById('yourStatus');
const startBtn = document.querySelector(".start_now").addEventListener("click", start);
const startGame = document.querySelector(".start_game").addEventListener("click", start);
const board = document.querySelector('.matrix')
const gameData = { WOLF_COUNT: 3, FENCE_COUNT: 1, }
const boxSize = 8 * 8;
const free = 0;
const rock = 5;


const rabbit = 1;
const wolf = 2;
const fence = 3;
const house = 4;
const persons = {
    1: {

        url: 'images/rabbit.png',
        moves: [free, wolf, house],
    },
    2: {
        url: 'images/wolves.png',
        moves: [free, rabbit]
    },
    3: {
        url: 'images/fence.png',
    },
    4: {
        url: 'images/house.jpg',
    }
};

//random coords
const generateRandomCoords = (count) => {
    return Math.floor(Math.random() * count);
}

// UI
const userInterFace = () => {

    matrixSize = Number(document.getElementById("select").value);
    matrix = new Array(matrixSize).fill(free)
        .map(() => new Array(matrixSize).fill(free));


    gameData.WOLF_COUNT = (matrix.length * 0.6);
    gameData.FENCE_COUNT = (matrix.length * 0.4);

    //dom
    gameStatus.style.display = "none"
    board.innerHTML = "";
    board.style.width = matrixSize * boxSize
    matrix.forEach((x, indexX) => {
        x.forEach((y, indexY) => {
            const block = document.createElement("div");
            board.appendChild(block);
            block.id = `${indexX}${indexY}`;
        });
    })
};

const appearedRabbit = (code) => {
    const possibleSteps = getPossibleStepDirection(possibleDirections(rabbit)[0], rabbit);
    Object.keys(possibleSteps).forEach(key => {
        if (key == code) {
            getGameResult(possibleSteps[key]);
            rabbitPositionUpdate(getPersonsCoords(rabbit)[0], possibleSteps[key], rabbit);
        }
    });
}

const appearedWolfs = () => {
    for (i = 0; i < gameData.WOLF_COUNT; i++) {
        wolfsAction(getPersonsCoords(wolf)[i], possibleDirections(wolf)[i], wolf);
    }
}

function generateRandomFreeCords(board) {
    const x = generateRandomCoords(matrix.length);
    const y = generateRandomCoords(matrix.length);

    if (board[x][y] === free) {
        return [x, y];
    }
    return generateRandomFreeCords(matrix);
}

///position persons
function positionPerson(person, count) {
    for (i = 0; i < count; i++) {
        const [x, y] = generateRandomFreeCords(matrix);
        matrix[x][y] = person;

        //dom
        const img = document.createElement('img');
        img.setAttribute("src", persons[person].url);
        document.getElementById(`${x}${y}`).appendChild(img);
    }
}

function positionGameElements() {

    positionPerson(house, 1);
    positionPerson(rabbit, 1);
    positionPerson(wolf, gameData.WOLF_COUNT);
    positionPerson(fence, gameData.FENCE_COUNT);
}

///action wolfs
const wolfsAction = (personIndex, allPossibleDirections) => {
    rabbitPositionUpdate(
        personIndex,
        rabbitNearestStep(getPossibleStepDirection(allPossibleDirections, wolf), personIndex, wolf),
        wolf);
}

const rabbitNearestStep = (wolfsSteps) => {
    const [rabbitX, rabbitY] = getPersonsCoords(rabbit)[0];
    let nearBlock = [];
    Object.keys(wolfsSteps).map(key => {
        return wolfsSteps[key];
    }).reduce((result, coords) => {
        const putagorasTheoree = Math.floor(Math.sqrt(Math.pow(Math.abs(rabbitX - coords[0]), 2) + Math.pow(Math.abs(rabbitY - coords[1]), 2)));
        if (putagorasTheoree < result || result === null) {
            result = putagorasTheoree;
            nearBlock = coords;
        }
        return result;
    }, result = null)

    return nearBlock;
}

///update position rabbit
const rabbitPositionUpdate = (index, step, person) => {

    const [oldX, oldY] = index;
    const [stepX, stepY] = step;
    matrix[oldX][oldY] = free;
    getGameResult(step);
    matrix[stepX][stepY] = person;

    //dom
    const rabbit = document.getElementById(`${oldX}${oldY}`).firstChild;
    document.getElementById(`${stepX}${stepY}`).appendChild(rabbit);
    document.getElementById(`${oldX}${oldY}`).removeChild;
}


function getWolfPossibleSteps(cordinates) {
    const possibleCoordinates = cordinates.map(coordinate => {
        coordinate < 0 ? (coordinate = 0)
            : coordinate > matrix.length - 1 ? (coordinate = matrix.length - 1)
                : null
        return coordinate;
    })
    return possibleCoordinates;
}


function hitBorder(cordinates) {
    return cordinates.map(coordinate => {
        coordinate > matrix.length - 1 ? (coordinate = 0)
            : coordinate < 0 ? (coordinate = matrix.length - 1)
                : null;
        return coordinate;
    })

}

const getPossibleStepDirection = (allDirections, person) => {

    return Object.keys(allDirections).reduce((personPossibleSteps, index) => {
        const [newX, newY] = person === rabbit
            ? hitBorder(allDirections[index])
            : getWolfPossibleSteps(allDirections[index]);

        if (persons[person].moves.includes(matrix[newX][newY])) {
            personPossibleSteps[index] = [newX, newY];
        }
        return personPossibleSteps
    }, {})
}



const getPersonsCoords = person => {
    return matrix.reduce((aggr, arr, row) => {
        arr.forEach((item, col) => {
            if (item === person)
                aggr.push([x, y] = [row, col]);
        });
        return aggr
    }, [])
}



const possibleDirections = person => {
    return getPersonsCoords(person)
        .map(coords => {
            const [x, y] = coords;
            return ({
                37: [X, Y] = [x, y - 1],
                38: [X, Y] = [x - 1, y],
                39: [X, Y] = [x, y + 1],
                40: [X, Y] = [x + 1, y],
            })
        });

}

/// GAME OVER AND STATUS 
function statusGame(status) {
    statusText.innerText = status;
    gameStatus.style.display = "block";
    matrix = null
}

function getGameResult(checkCoords) {
    const [x, y] = checkCoords;
    const RabbitCoords = matrix[x][y];

    if (RabbitCoords) {
        statusGame("You loss");
    }
    if (RabbitCoords == house) {
        statusGame("You Won!");
    }
}

///start-game
function start() {
    userInterFace();
    positionGameElements();
}