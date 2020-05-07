function startTest(){
    document.getElementById("button_start").hidden=true;
    document.getElementById("button_next").hidden=false;
    document.getElementById("button_findVars").hidden=true;

    var attention=document.createElement('p')
    attention.setAttribute("id","attention")
    attention.innerHTML="Ответы вводить формате через запятую, например A,B"
    form.append(attention)

    var question = document.createElement('p')
    question.setAttribute("id","question")
    form.append(question)
    
    var answer=document.createElement("INPUT")
    answer.setAttribute("type", "text");
    answer.setAttribute("id","answer")
    form.append(answer)

    generQuestion()
}
  
function startFindVars(){
    document.getElementById("button_start").hidden=true;
    document.getElementById("button_findVars").hidden=true;
    document.getElementById("button_find").hidden=false;

    var field=document.createElement("INPUT")
    field.setAttribute("type", "text");
    field.setAttribute("id","field")
    find_vars.append(field)

    var answer = document.createElement('p')
    answer.setAttribute("id","answer")
    find_vars.append(answer)
}