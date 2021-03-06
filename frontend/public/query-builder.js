let mKeyFieldsCourses = ["avg", "pass", "fail", "audit", "year"];
let mKeyFieldsRooms = ["lat", "lon", "seats"];

CampusExplorer.buildQuery = function () {
    let query = {};
    let dataID;
    let coursesTab = document.querySelector("nav.nav a[data-type='courses']");
    let roomsTab = document.querySelector("nav.nav a[data-type='rooms']");
    if (coursesTab.getAttribute("class") === "nav-item tab active") {
        dataID = "courses_";
    }
    if (roomsTab.getAttribute("class") === "nav-item tab active") {
        dataID = "rooms_";
    }
    let where = {};
    let options = {};
    let columns = [];
    let order = {};
    let transformations = {};
    let group = [];
    let apply = [];
    where = buildWhere(dataID);
    query["WHERE"] = where;
    columns = buildColumns(dataID);
    order = buildOrder(dataID);
    options["COLUMNS"] = columns;
    if (order !== "") {                             // order is optional: if not blank, then add it to options
        options["ORDER"] = order;
    }
    query["OPTIONS"] = options;
    group = buildGroup(dataID);
    apply = buildApply(dataID);
    if (group.length !== 0) {                       // transformations are optional: as long as something in groups or apply present, will add transformations
        transformations["GROUP"] = group;
        transformations["APPLY"] = apply;
        query["TRANSFORMATIONS"] = transformations;
    }
    return query;
};

function buildWhere(dataID) {
    let where = {};
    let formElement;
    let listOfConditions = [];
    if (dataID === "courses_") {
        formElement = document.querySelector("form[data-type='courses']");
        listOfConditions = formElement.getElementsByClassName("control-group condition");
    }
    if (dataID === "rooms_") {
        formElement = document.querySelector("form[data-type='rooms']");
        listOfConditions = formElement.getElementsByClassName("control-group condition");
    }
    if (listOfConditions.length === 0) {
        return where;
    }
    let whereFiltersOrAnd = [];
    for (let controlGroupCondition of listOfConditions) {
        let comparisonKeyElement = controlGroupCondition.querySelector("div.control.operators option[selected='selected']");
        let comparisonKey = comparisonKeyElement.getAttribute("value").trim();  // IS EQ GT LT
        let comparisonAttributeElement = controlGroupCondition.querySelector("div.control.fields option[selected='selected']");
        let comparisonAttributeSkeyMkey = comparisonAttributeElement.getAttribute("value").trim().toLowerCase();
        let comparisonAttribute = dataID + comparisonAttributeSkeyMkey;   // courses_audit courses_pass etc
        let comparisonInputElement = controlGroupCondition.querySelector("div.control.term input[type='text']");
        let comparisonInput = comparisonInputElement.getAttribute("value").trim();     // "cpsc" 90 etc
        if (mKeyFieldsCourses.includes(comparisonAttributeSkeyMkey) || mKeyFieldsRooms.includes(comparisonAttributeSkeyMkey)) {
            comparisonInput = Number(comparisonInput);      // input should be a number instead of string
        }
        let comparisonObject = {};
        comparisonObject[comparisonAttribute] = comparisonInput;    // { "courses_fail" : 20 }
        let notElement = controlGroupCondition.querySelector("div.control.not input");
        if (notElement.getAttribute("checked") === "checked") {     // not checkbox selected
            let notObject = {};
            notObject[comparisonKey] = comparisonObject;    //  { "GT" : { "courses_fail" : 20 } }
            if (listOfConditions.length === 1) {    // only 1 condition
                if (dataID === "courses_" && document.getElementById("courses-conditiontype-none").checked) {       // check if 'none of the following' is selected: put NOT in NOT, then into WHERE
                    let notObjectOuter = {};
                    notObjectOuter["NOT"] = notObject;
                    where["NOT"] = notObjectOuter;
                    return where;
                }
                if (dataID === "rooms_" && document.getElementById("rooms-conditiontype-none").checked) {           // check if 'none of the following' is selected: put NOT in NOT, then into WHERE
                    let notObjectOuter = {};
                    notObjectOuter["NOT"] = notObject;
                    where["NOT"] = notObjectOuter;
                    return where;
                }
                where["NOT"] = notObject;           // { "NOT" : { "GT" : { "courses_fail" : 20 } } }
                return where;
            } else {                                // more than 1 condition, put into array
                let notObject2 = {};
                notObject2["NOT"] = notObject;      // { "NOT" : { "GT" : { "courses_fail" : 20 } } }
                whereFiltersOrAnd.push(notObject2);
            }
        } else {                                                            // not checkbox isn't selected
            if (listOfConditions.length === 1) {            // only 1 condition, put directly into WHERE
                if (dataID === "courses_" && document.getElementById("courses-conditiontype-none").checked) {   // check if 'none of the following' is selected: put NOT around it before putting to WHERE
                    let notObject = {};
                    notObject[comparisonKey] = comparisonObject;
                    where["NOT"] = notObject;
                    return where;
                }
                if (dataID === "rooms_" && document.getElementById("rooms-conditiontype-none").checked) {          // check if 'none of the following' is selected: put NOT around it before putting to WHERE
                    let notObject = {};
                    notObject[comparisonKey] = comparisonObject;
                    where["NOT"] = notObject;
                    return where;
                }
                where[comparisonKey] = comparisonObject;    //  { "GT" : { "courses_fail" : 20 } }
                return where;
            } else {                                        // more than 1 condition, put into array
                let conditionObject = {};
                conditionObject[comparisonKey] = comparisonObject;  //  { "GT" : { "courses_fail" : 20 } }
                whereFiltersOrAnd.push(conditionObject);
            }
        }
    }
    if (dataID === "courses_") {
        let coursesConditionAllElement = document.getElementById("courses-conditiontype-all");
        let coursesConditionAnyElement = document.getElementById("courses-conditiontype-any");
        let coursesConditionNoneElement = document.getElementById("courses-conditiontype-none");
        if (coursesConditionAllElement.checked) {
            where["AND"] = whereFiltersOrAnd;
        }
        if (coursesConditionAnyElement.checked) {
            where["OR"] = whereFiltersOrAnd;
        }
        if (coursesConditionNoneElement.checked) {
            let notObjectMany = {};
            notObjectMany["OR"] = whereFiltersOrAnd;
            where["NOT"] = notObjectMany;
        }
    }
    if (dataID === "rooms_") {
        let roomsConditionAllElement = document.getElementById("rooms-conditiontype-all");
        let roomsConditionAnyElement = document.getElementById("rooms-conditiontype-any");
        let roomsConditionNoneElement = document.getElementById("rooms-conditiontype-none");
        if (roomsConditionAllElement.checked) {
            where["AND"] = whereFiltersOrAnd;
        }
        if (roomsConditionAnyElement.checked) {
            where["OR"] = whereFiltersOrAnd;
        }
        if (roomsConditionNoneElement.checked) {
            let notObjectMany = {};
            notObjectMany["OR"] = whereFiltersOrAnd;
            where["NOT"] = notObjectMany;
        }
    }
    return where;
}

function buildColumns(dataID) {
    let columns = [];
    let formElement;
    if (dataID === "courses_") {
        formElement = document.querySelector("form[data-type='courses']");  // choose appropriate form
    }
    if (dataID === "rooms_") {
        formElement = document.querySelector("form[data-type='rooms']");
    }
    let formColumnsSection = formElement.querySelector("div.form-group.columns");  // grab only columns section
    let columnsInputsAll = formColumnsSection.querySelectorAll("input");
    let containsAtLeastOneCheckedColumn = false;
    for (let columnInput of columnsInputsAll) {                     // check to see at least one column is checked
        if (columnInput.getAttribute("checked") === "checked") {
            containsAtLeastOneCheckedColumn = true;
        }
    }
    if (containsAtLeastOneCheckedColumn) {
        let columnsElementsChecked = formColumnsSection.querySelectorAll("input[checked='checked']");   // gather all input boxes checked
        for (let columnElement of columnsElementsChecked) {         // for each checked input, grab the value (ie: "instructor") and (if needed) attach to the id string, then push to final list
            let columnKeyField = columnElement.getAttribute("value").trim();       // "instructor"
            if (columnElement.parentNode.getAttribute("class") === "control transformation") {      // if parent is from a transformation apply key div, don't add id string to it
                columns.push(columnKeyField);
            } else {
                let columnKey = dataID + columnKeyField;        // "courses_instructor"
                columns.push(columnKey);
            }
        }
    }
    return columns;
}

function buildOrder(dataID) {
    let orderSingle = "";
    let orderMultiple = {};
    let formElement;
    if (dataID === "courses_") {
        formElement = document.querySelector("form[data-type='courses']");  // choose appropriate form
    }
    if (dataID === "rooms_") {
        formElement = document.querySelector("form[data-type='rooms']");
    }
    let formOrderSection = formElement.querySelector("div.form-group.order");  // grab only order section
    let orderOptionsAll = formOrderSection.querySelectorAll("option");
    let containsAtLeastOneSelectedOrder = false;
    for (let orderOption of orderOptionsAll) {                     // check to see at least one order key is selected
        if (orderOption.getAttribute("selected") === "selected") {
            containsAtLeastOneSelectedOrder = true;
        }
    }
    if (!containsAtLeastOneSelectedOrder) {                 // none selected, return empty ""
        return orderSingle;
    } else {
        let orderOptionsSelected = formOrderSection.querySelectorAll("option[selected='selected']");   // gather all option elements with selected = "selected"
        let descendingCheckbox;
        if (dataID === "courses_") {
            descendingCheckbox = document.getElementById("courses-order");
        } else {
            descendingCheckbox = document.getElementById("rooms-order");
        }
        if (orderOptionsSelected.length === 1 && (descendingCheckbox.getAttribute("checked") !== "checked")) {      // only one selected and ascending, return 1 string
            let orderKeyField = orderOptionsSelected.item(0).getAttribute("value").trim();
            if (orderOptionsSelected.item(0).getAttribute("class") === "transformation") {
                orderSingle = orderKeyField;                          // check if applyKey, if so, then don't add ID to string
                return orderSingle;
            } else {
                orderSingle = dataID + orderKeyField;                 // not an applyKey, must add ID to string
                return orderSingle;
            }
        }
        let orderKeys = [];
        if (descendingCheckbox.getAttribute("checked") === "checked") {
            orderMultiple["dir"] = "DOWN";
        } else {
            orderMultiple["dir"] = "UP";
        }
        for (let orderOption of orderOptionsSelected) {
            let orderKeyField = orderOption.getAttribute("value").trim();
            if (orderOption.getAttribute("class") === "transformation") {
                orderKeys.push(orderKeyField);
            } else {
                let orderKey = dataID + orderKeyField;        // "courses_instructor"
                orderKeys.push(orderKey);
            }
        }
        orderMultiple["keys"] = orderKeys;
        return orderMultiple;
    }
}

function buildGroup(dataID) {
    let group = [];
    let formElement;
    if (dataID === "courses_") {
        formElement = document.querySelector("form[data-type='courses']");  // choose appropriate form
    }
    if (dataID === "rooms_") {
        formElement = document.querySelector("form[data-type='rooms']");
    }
    let groupSection = formElement.querySelector("div.form-group.groups");  // grab only group section
    let groupInputsAll = groupSection.querySelectorAll("input");
    let containsAtLeastOneChecked = false;
    for (let groupInput of groupInputsAll) {                     // check to see at least one group box is checked
        if (groupInput.getAttribute("checked") === "checked") {
            containsAtLeastOneChecked = true;
        }
    }
    if (containsAtLeastOneChecked) {
        let groupElementsChecked = groupSection.querySelectorAll("input[checked='checked']");   // gather all input boxes checked
        for (let groupElement of groupElementsChecked) {         // for each checked input, grab the value (ie: "instructor") and attach to the id string, then push to final list
            let groupKeyField = groupElement.getAttribute("value").trim().toLowerCase();       // "instructor"
            let groupKey = dataID + groupKeyField;        // "courses_instructor"
            group.push(groupKey);
        }
    }
    return group;
}

function buildApply(dataID) {
    let apply = [];
    let formElement;
    let listOfApplyRules;
    if (dataID === "courses_") {
        formElement = document.querySelector("form[data-type='courses']");
        listOfApplyRules = formElement.getElementsByClassName("control-group transformation");
    }
    if (dataID === "rooms_") {
        formElement = document.querySelector("form[data-type='rooms']");
        listOfApplyRules = formElement.getElementsByClassName("control-group transformation");
    }
    if (listOfApplyRules.length !== 0) {
        for (let applyRule of listOfApplyRules) {
            let applyKeyInput = applyRule.querySelector("div.control.term input[type='text']");     // applyKey text box
            let applyKey = applyKeyInput.getAttribute("value").trim();                 // applyKey string, ex: "overallAvg"
            let applyTokenElement = applyRule.querySelector("div.control.operators option[selected='selected']");
            let applyToken = applyTokenElement.getAttribute("value").trim().toUpperCase();               // MAX MIN COUNT SUM AVG
            let keyFieldElement = applyRule.querySelector("div.control.fields option[selected='selected']");
            let keyField = keyFieldElement.getAttribute("value").trim().toLowerCase();              // "instructor"
            let keyIDAndField = dataID + keyField;                                          // "courses_instructor"
            let applyTokenKeyObject = {};
            applyTokenKeyObject[applyToken] = keyIDAndField;                                // { "MAX" : "courses_avg" }
            let applyRuleObject = {};
            applyRuleObject[applyKey] = applyTokenKeyObject;                                // { "highestAvg": { "MAX": "courses_avg" } }
            apply.push(applyRuleObject);
        }
    }
    return apply;
}
