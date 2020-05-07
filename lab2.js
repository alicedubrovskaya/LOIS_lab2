var atomsGlobal;
var setsGlobal;
var resultsGlobal;
var clickFindVars=0;




function addBrackets(str){
    return "("+str+")"
}

function action1(str){//опер-р+константа
    var random=Math.random();
    str+=((random >= 0.3) ? '|' : (random >= 0.2 ? '&' : (random >= 0.1 ? '~' : '->')))
   // str+=operationsForGenerating[Math.round(Math.random()*3)];
    str+=constants[Math.round(Math.random()*countOfArguments)];
    str=addBrackets(str);
    count++;
    return str;
}

function action2(str){ //отрицание
    str="!"+str;
    str=addBrackets(str);
    count++;
    return str
}

function action3(str){
    miniFormula=""
    countMini=0
    var random=Math.random();
    str+=((random >= 0.3) ? '|' : (random >= 0.2 ? '&' : (random >= 0.1 ? '~' : '->')))
  //  str+=operationsForGenerating[Math.round(Math.random()*3)];
    generateMiniFormula(constants[Math.round(Math.random()*countOfArguments)], 3)
    str+=miniFormula;
    str=addBrackets(str)
    return str
}
function generateMiniFormula(formula1,neededSize){
    countMini++
    var actionNumber=Math.round(((Math.random()*1)+1))
    switch(actionNumber){
        case 1:{
             miniFormula=action1(formula1);
             break;
        }
        case 2: {
            miniFormula=action2(formula1);
            break;
        }
    }
    if (countMini>=neededSize){
        return
    }
    else generateMiniFormula(miniFormula, neededSize)
}
function generateFormula(formula1, neededSize){
    var actionNumber=Math.round(((Math.random()*2)+1))
    
    switch(actionNumber){
        case 1:{
             formula=action1(formula1);
             break;
        }
        case 2: {
            formula=action2(formula1);
            break;
        }
        case 3:{
            formula=action3(formula1);
            break;
        }
    }
    if (count>=neededSize){
        return
    }
    else generateFormula(formula, neededSize)
}

//проверка на корректность формулы
function checkOne() {
    var copy = formulaGlobal;

    while (copy.match(/([|&~]|->)/g) || !copy.match(/^[A()]+$/g)) {
        var prevCopy = copy;
        copy = copy.replace(/\(![A-Z01]\)/g, 'A');
        copy = copy.replace(/\([A-Z01]([|&~]|->)[A-Z01]\)/g, 'A');
        if (copy === prevCopy) return false;
    }
    return copy === 'A';
}

function checkTwo() { 
    var openingBrackets = formulaGlobal.split('(').length - 1;
    var closingBrackets = formulaGlobal.split(')').length - 1;
    
    return openingBrackets == closingBrackets;
}

function areSymbolsCorrect(){
    return formulaGlobal.match(/^([10A-Z()|&!~]|->)*$/g);
}

function isSyntaxCorrect(){
    return formulaGlobal.match(/^[A-Z10]$/) ||
    (!formulaGlobal.match(/\)\(/) && !formulaGlobal.match(/[A-Z10]([^|&~]|(?!->))[10A-Z]/) &&
    !formulaGlobal.match(/![A-Z10][^)]/) && !formulaGlobal.match(/[^(]![A-Z10]/) &&
    !formulaGlobal.match(/\([A-Z10]\)/) && checkOne() && checkTwo());
}

//нахождение фиктивных пропозициональных переменных
function findVars() {
    
    var atoms = [...new Set(formulaGlobal.split(/[^A-Z]/).filter(atom => atom !== ''))];

    if (atoms.length == 0) {
        return [];
    }

    var sets = getSets(atoms);
    var results = getFunctionResults(formulaGlobal, atoms, sets);
    var dummies = getVars(formulaGlobal, atoms, sets);

    atomsGlobal = atoms;
    setsGlobal = sets;
    resultsGlobal = results;

    return dummies;
}


function getUniqueAtoms(formula) {
    return [...new Set(formula.split(/[^A-Z]/).filter(atom => atom !== ''))];
}

function getSets(atoms) {
    var sets = [];

    for (var i = 0; i < Math.pow(2, atoms.length); i++) {
        var binary = Array.from(i.toString(2));
        if (binary.length !== atoms.length) {
            var zerosLeft = Array.from('0'.repeat(atoms.length - binary.length));
            binary.forEach(digit => zerosLeft.push(digit));
            binary = zerosLeft;
        }

        sets.push(binary);
    }
    return sets;
}

function getFunctionResults(formula, atoms, sets) {
    var results = [];
    sets.forEach(set => {
        var addedFormula = addValues(set, atoms, formula);
        var formulaValue = getFormulaValue(addedFormula);
        results.push(formulaValue);
    });
    
    return results;
}

function addValues(values, atoms, formula) {
    for (i = 0; i < atoms.length; i++) {
        formula = formula.replace(new RegExp(atoms[i], 'g'), values[i]);
    }

    return formula;
}

function getFormulaValue(formula) {
    while (!formula.match(/^[01]$/g)) {
        formula = negation(formula);
        
        formula = conjunction(formula);
        formula = disjunction(formula);
        
        formula = equivalence(formula);
        formula = implication(formula);
    }

    return formula;
}

function conjunction(formula) {
    formula = formula.replace(/\(1&1\)/g, '1');
    formula = formula.replace(/\(0&1\)|\(1&0\)|\(0&0\)/g, '0');

    return formula;
}

function negation(formula) {
    formula = formula.replace(/\(!1\)/g, '0');
    formula = formula.replace(/\(!0\)/g, '1');

    return formula;
}

function equivalence(formula) {
    formula = formula.replace(/\(1~1\)|\(0~0\)/g, '1');
    formula = formula.replace(/\(1~0\)|\(0~1\)/g, '0');

    return formula;
}

function implication(formula) {
    formula = formula.replace(/\(1->0\)/g, '0');
    formula = formula.replace(/\(0->1\)|\(1->1\)|\(0->0\)/g, '1');

    return formula;
}

function disjunction(formula) {
    formula = formula.replace(/\(0\|0\)/g, '0');
    formula = formula.replace(/\(0\|1\)|\(1\|0\)|\(1\|1\)/g, '1');

    return formula;
}



function getVars(formula, atoms, sets) {
    var dummyVars = [];
    
    atoms.forEach((atom, index) => {
        var actualResults = [];
        var dummyResults = [];

        sets.forEach(set => {
            var dummySet = [];
            set.forEach(value => dummySet.push(value));
            dummySet[index] = '0';

            var dummyAddedValues = addValues(dummySet, atoms, formula);
            var actualAddedValues = addValues(set, atoms, formula);

            dummyResults.push(getFormulaValue(dummyAddedValues));
            actualResults.push(getFormulaValue(actualAddedValues));
        });

        if (dummyResults.every((result, index) => result === actualResults[index])) {
            dummyVars.push(atom);
        }
    });

    return dummyVars;
}


function startFindingVars(){
    clickFindVars++;
    if (clickFindVars>1) {
        continueFindNew()
    }

    document.getElementById("button_find").hidden=true;
    
    var input = document.getElementById("find_vars");
    var content=input.elements[0].value;
    formulaGlobal=content;

    if  (!(areSymbolsCorrect() && isSyntaxCorrect()))
    {
        var itemInformation=document.createElement('p')
        itemInformation.innerHTML="Формула некорректна!";
        answer.append(itemInformation)
    }
    else{
        var dummies = findVars();
        var itemInformation=document.createElement('p')
    
        if (dummies.length !== 0) {
            itemInformation.innerHTML="Фиктивные пропозициональные переменные: "+[...dummies];
            var truthTable = document.createElement('p');
            drawTruthTable(truthTable);
            answer.append(truthTable)
        } else {
            itemInformation.innerHTML = "Фиктивные пропозициональные переменные отсутствуют";
        }
        answer.append(itemInformation)
    }

    document.getElementById("button_find").hidden=false;
}

function continueFindNew(){
    var elem = document.getElementById("answer");
    elem.parentNode.removeChild(elem);

    var answer = document.createElement('p')
    answer.setAttribute("id","answer")
    find_vars.append(answer)
}

//построение таблицы на вывод
function drawTruthTable(truthTableElement) {
    truthTableElement.innerHTML = atomsGlobal.join(' | ') + ' | f()<br><hr>';
    setsGlobal.forEach((set, index) => {
        truthTableElement.innerHTML += set.join(' | ') + ' | ' + resultsGlobal[index] + '<br>';
    });
}


//тест
function generQuestion() {
    count=0; 
    formula=""
    var countOfArguments=Math.round((Math.random()*1))
    constants=[]
    var indexOne=Math.round(Math.random()*27)
    constants.push(constantsGlobal[indexOne])

    if (countOfArguments==1){
        do {
            var indexTwo=Math.round(Math.random()*27)
        }
        while (indexTwo==indexOne)
        constants.push(constantsGlobal[indexTwo])
    }

    generateFormula(constants[Math.round((Math.random()*countOfArguments))], 2)
    formulasForUserArray.push(formula)
    question.innerHTML=(clicks+1)+". "+formula;
}

function getAnswer(){
    var input = document.getElementById("form");
    var content=input.elements[0].value;
    var currentAnswer = content.split(',').filter(atom => atom !== '')
    answersOfUser.push(currentAnswer)
    answer.value="";
}
function end(){ 
    document.getElementById("question").hidden=true;
    document.getElementById("answer").hidden=true;
    document.getElementById("button_next").hidden=true;


    for (var iterator=0; iterator<10;iterator++){
        //стр-ра: output<-outputElement<-itemInformation
        var outputElement = document.createElement('form')
        output.append(outputElement)

    
/*      var dummies = findVars();
        var itemInformation=document.createElement('p')
    
        if (dummies.length !== 0) {
            itemInformation.innerHTML="Фиктивные пропозициональные переменные: "+[...dummies];
            var truthTable = document.createElement('p');
            drawTruthTable(truthTable);
            answer.append(truthTable)
        } else {
            itemInformation.innerHTML = "Фиктивные пропозициональные переменные отсутствуют";
        }
        answer.append(itemInformation)
         */
        
        formulaGlobal=formulasForUserArray[iterator]
        var dummies=findVars()

        var itemInformation=document.createElement('p')
        itemInformation.innerHTML=(iterator+1)+". "+formulaGlobal;
        outputElement.append(itemInformation)

        var answerNumberIterator=answersOfUser[iterator];
        let isCorrectAnswered = (answerNumberIterator.length === dummies.length) && 
        (answerNumberIterator.every(atom => dummies.indexOf(atom) !== -1));

         if (isCorrectAnswered){
             points++
             itemInformation.innerHTML=itemInformation.innerText+" Ваш ответ верный"
             
         }
         else{
            itemInformation.innerHTML=itemInformation.innerText+" Ваш ответ неверный"
         }   

         var itemInformation=document.createElement('p')
         if (dummies.length != 0) {
            itemInformation.innerHTML="Фиктивные пропозициональные переменные: "+[...dummies];
            var truthTable = document.createElement('p');
            drawTruthTable(truthTable);
            outputElement.append(truthTable)
        } else {
            itemInformation.innerHTML = "Фиктивные пропозициональные переменные отсутствуют";
        }
        outputElement.append(itemInformation)

        }
    var itemInformation=document.createElement('p')
    itemInformation.innerHTML="Ваш результат: "+points*10+"%";
    outputElement.append(itemInformation)
}
function test(){
    clicks++
    document.getElementById("attention").hidden=true;
    getAnswer() //взяли предыд ответ
    if (clicks<10){
        generQuestion() //сгенерировали вопрос на текущий
    }
    else {
        end()
        document.getElementById("output").hidden=false;
    }
}
