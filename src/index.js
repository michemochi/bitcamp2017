import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

var request = require('sync-request');

/*ReactDOM.render(
  <App />,
  document.getElementById('root')
);*/

//var api_key = 'TFGsLFJYAH8AQ1iX3LFejydqvYlqVP2fsLqyBjgj';
var api_key = '74SSKHDMviRjqry2ImolVeLHmtNe4upuhyyXRxZu';
var globalAllergensList =
    [ { allergen: "Lactose"
      , ingredients:
          [ "PASTEURIZED MILK"
          , "MILK"
          , "CHEDDAR"
          , "GRADE A PASTEURIZED MILK"
          , "SKIM MILK"
          , "PASTEURIZED CULTURED MILK"
          , "CREAM"
          , "CREAM CHEESE"
          , "SOUR CREAM"]},
      { allergen: "Tree Nuts"
      , ingredients:
          [ "COCONUTS"
          , "MADE FROM COCNT"
          , "HAZELNUTS"
          , "CASHEWS"
          , "ALMONDS"
          , "WALNUTS"
          , "PECANS"
          , "PISTACHIOS"
          , "PINONS"
          , "PINE NUTS"
          , "COCONUT"
          , "HAZELNUT"
          , "CASHEW"
          , "ALMOND"
          , "WALNUT"
          , "PECAN"
          , "PISTACHIO"
          , "PINON"
          , "DRY RSTD ALMONDS"
          , "DRY RSTD MACADAMIA NUTS"
          , "DRY RSTD CASHEWS"
          , ]},
      { allergen: "Peanuts"
      , ingredients:
          [ "PEANUT"
          , "PEANUTS"
          , "PNUT"
          , "PNUTS"
          , "GROUND PEANUTS"
          , "PEANUT OIL"
          , "PEANUT PASTE"]},
      { allergen: "Sunflower"
      , ingredients:
          [ "SUNFLOWER OIL" ]},
      { allergen: "Soy"
      , ingredients:
          [ "SOY"
          , "SOYBEAN"
          , "TOFU"
          , "EDAMAME"
          , "SOYBEAN OIL ENRICHED BLEACHED WHEAT FLOUR"
          , "SOYBEAN OIL"
          , "SOY BEAN OIL"]},
      { allergen: "Shellfish"
      , ingredients:
          [ "FREEZE DRIED SHRIMP"
          , "LOBSTER"
          , "SHRIMP"
          , "CRAB"
          , "CRAB MEAT"
          , "GIANT TOP SHELLFISH"
          , "SNOW CRAB MEAT"
          , "SNOW CRAB EXTRACT"
          , "SWIMMING CRAB EXTRACT"
          , "KING CRAB MEAT"
          , "PRAWN"
          , "PRAWNS"]},
      { allergen: "Eggs"
      , ingredients:
          [ /[0-9]+ GRADE [A-C] (JUMBO|MEDIUM|LARGE|SMALL|LIZARD) EGGS/gi
          , "WHOLE EGGS"
          , /EGGS{0,1}/gi
          , /EGG WHITES{0,1}/gi ]},
      { allergen: "Fish"
      , ingredients:
          [ /^(.+ ){0,1}(POLLOCK|TUNA|COD|SARDINE|TILAPIA|SALMON|ANCHOVY|MAHI-MAHI|WAHOO|WHITEFISH)(.+){0,1}/gi
          , /(REFINED){0,1} FISH OIL/gi
          , "FISH" ]},
      { allergen: "Wheat"
      , ingredients:
          [ /(organic){0,1} +(whole){0,1} +WHEAT/gi ]},
    ];

var global_food_items = [];

function doSearch(q, offset = 0, max = 10, doStupidShit = false) {
        var url = 'https://api.nal.usda.gov/ndb/search?api_key=' + api_key + '&q=' + q + '&format=json&offset=' + offset + '&max=' + max;
        console.log(url);
        var response = request("get", url);
        console.log(response);
        //response = response.json();
        response = JSON.parse(response.body);
        var result = response;
        console.log(result);
        var retval = result.list.item;

        if (result.list.total > result.list.end + offset && doStupidShit) {
                return retval.concat(doSearch(q, result.list.end + offset));
        } else {
                return retval;
        }
}

function getFoodItem(ndbno) {
    var url = 'https://api.nal.usda.gov/ndb/reports/?ndbno=' + ndbno + '&type=f&format=json&api_key=' + api_key;
    console.log(url);
    var response = request('get', url);
    response = JSON.parse(response.body);
    return response.report;
}

function checkAllergens(report, allergens) {
    var i, flags = [];
    console.log("checking nutrients");
    console.log(report);
    var ingredients = "";
    if (report.food.ing !== undefined) {
        ingredients = ingredients + report.food.ing.desc;
    }
    if (report.food.sd !== undefined) {
        ingredients = ingredients + report.food.sd;
    }
    ingredients = String.replace(ingredients, /[(\][)*&]/g, ',');
    ingredients = String.replace(ingredients, /[ \/](and|or) /gi, ',');
    console.log(ingredients);
    ingredients =
        ingredients
            .split(',')
            .map((x) => x.trim())
            .filter((x) => x !== "");
    var last = ingredients[ingredients.length - 1];
    last = last.substring(0, last.length - 1);
    ingredients[ingredients.length - 1] = last;
    for (i = 0; i < ingredients.length; i++) {
        var j;
        var ingredient = ingredients[i];
        for (j = 0; j < allergens.length; j++) {
            var k;
            var allergen = allergens[j];
            for (k = 0; k < allergen.ingredients.length; k++) {
                var contains = false;
                if (typeof allergen.ingredients[k] === 'object') {
                    contains = ingredient.toLowerCase().match(allergen.ingredients[k]);
                } else if (typeof allergen.ingredients[k] === 'string') {
                    contains = ingredient.toLowerCase() === allergen.ingredients[k].toLowerCase();
                }
                if (contains) {
                    var l = 0;
                    var contains = false;
                    while (l < flags.length) {
                        if (l < flags.length && flags[l].toLowerCase().startsWith(allergen.allergen.toLowerCase())) {
                            contains = true;
                            flags[l] = flags[l] + ', ' + ingredient;
                            break;
                        }
                        l++;
                    }
                    if (!contains) {
                        flags.push(allergen.allergen + ' (' + ingredient);
                    }
                }
            }
        }
    }
    flags = flags.map((flag) => flag + ")");
    console.log(flags);
    return flags;
}

class FoodItem extends React.Component
{
    closeModal() {
        this.modal.style.display = "none";
    }

    constructor(props) {
        super(props);
        var report = getFoodItem(props.ndbno);
        this.state = {
            flags: checkAllergens(report, globalAllergensList)
        };
    }

    showModal() {
        //Get the modal
        this.modal.style.display = "block";
    }

    render() {
        var state = this.state;
        if (state == undefined) {
            var report = getFoodItem(this.props.ndbno);
            state = {
                flags: checkAllergens(report, globalAllergensList)
            };
        }
        var flags = state.flags.map((flag) => {return(<li>{flag}</li>)});
        var retval =
            (<div onclick={this.showModal}>
                <h1>{this.props.name}</h1>
                <h7>{this.props.group}</h7>
                <ul>{flags}</ul>
                <h7 style={{float: "bottom"}}>{this.props.ndbno}</h7>
                {this.modal}
            </div>);
        console.log(retval);
        return(retval);
    }
}

class FoodItemsList extends React.Component
{
    constructor() {
        super();
        this.state = {
            foodItems: []
        };
    }
    render(items) {
        var i = 0;
        console.log("trying to render a FoodItemList");
        return(
            <div>
                {
                    global_food_items.map(
                        (foodItem) => {
                            return (
                                <FoodItem
                                    group={foodItem.group}
                                    name={foodItem.name}
                                    ndbno={foodItem.ndbno}
                                    ds={foodItem.ds}
                                    key={i++} />)
                        })
                }
            </div>);
    }
}

function formatItems(items, index = 0) {
    if (index === items.length - 1) {
        return ["<div class = 'foodIteem'>" + items[index].name + "</div>"];
    } else {
        return ["<div class = 'foodIteem'>" + items[index].name + "</div>"].concat(formatItems(items, index + 1));
    }
}

/*function handle(text, target) {
    var i;
    target.innerHTML = "";
    for (i = 0; i < formatted.length; ++i) {
        target.innerHTML += formatted[i];
    }
    return;
}*/

function handleSearch(e) {
    var q = document.getElementById("five").value;
    var results = doSearch(q);
    //this.setState({foodItems: global_food_items});
    global_food_items = results;
    console.log(e);
    ReactDOM.render(
        <FoodItemsList
            q={document.getElementById("five".value)} />,
        document.getElementById("killMeNow"));
}

/*                <script>
                Get the modal
                var modal = document.getElementById('myModal');
                // Get the button that opens the modal
                var btn = document.getElementById("myBtn");
                // Get the <span> element that closes the modal
                var span = document.getElementsByClassName("close")[0];
                // When the user clicks the button, open the modal 
                btn.onclick = function() \{
                    modal.style.display = "block";
                \};
                // When the user clicks on <span> (x), close the modal
                span.onclick = function() \{
                    modal.style.display = "none";
                \};
                // When the user clicks anywhere outside of the modal, close it
                window.onclick = function(event) \{
                    if (event.target == modal) \{
                        modal.style.display = "none";
                    \}
                \};
                </script>*/

/*class SearchPage extends React.Component {
    render() {
        return (
            <div>
                <div class="topnav">
                <img src = "logomaker.png"></img>
                <input type="text" id="five" name="search" placeholder="Search products..." onSearch={handleSearch}></input>
                <button onClick={handleSearch}>search</button>
                <a href="#home">About</a>
                <a href="#news">Contact</a>
                <a href="#contact">Updates</a>
                <a href="#about">Home</a>
                </div>
                <div class="mainbody" id="killMeNow">
                <h2><font face = "arial">Search Results</font> </h2>
                </div>
                <div class = "endbody"><center>
                <a href = "#about">About WillThisKill.Me</a>
                <a href = "#info">USDA Information Page</a>
                <a href="#" class="fa fa-facebook"></a>
                <a href="#" class="fa fa-twitter"></a>
                <a href="#" class="fa fa-google"></a>
                <a href="#" class="fa fa-linkedin"></a>
                <a href="#" class="fa fa-youtube"></a>

                <p>
                &copy; 2017 willthiskill.me.
                Data based on USDA Food and Nutrition Database.</p></center>
                </div>
            </div>
        )
    }
}*/

/*function handleFirstSearch(e) {
    ReactDOM.render(
        <SearchPage />,
        document.getElementById("root"));
}*/

/*class WtkmHomepage extends React.Component {
    render() {
        return (
            <div>
                <div
                    style={{
                        overflow: 'hidden'
                      , backgroundColor: '#0000A0'
                      , paddingTop: '1%'
                      , paddingBottom: '1%'
                      , paddingLeft: '7%'
                      , paddingRight: '7%'
                    }}>
                    <img src="logomaker.png"></img>
                    <a href="#home">About</a>
                    <a href="#news">Contact</a>
                    <a href="#contact">Updates</a>
                    <a href="#about">Home</a>
                </div>
                <div class="mainbody">
                    <center>
                        <img src="http://foodallergyaustin.com/images/hero-icons.png"></img>
                        <h2>
                            <input
                                type="search"
                                id="five"
                                name="search"
                                placeholder="Search products..."
                                onSearch={handleFirstSearch}>
                            </input>
                            <button onClick={handleFirstSearch}>Search</button>
                        </h2>
                    </center>
                </div>
                <div class="endbody">
                    <center>
                        <a href="#about">About WillThisKill.Me</a>
                        <a href="#info">USDA Information Page</a>
                        <a href="#" class="fa fa-facebook"></a>
                        <a href="#" class="fa fa-twitter"></a>
                        <a href="#" class="fa fa-google"></a>
                        <a href="#" class="fa fa-linkedin"></a>
                        <a href="#" class="fa fa-youtube"></a>
                        <p>
                            &copy; 2017 willthiskill.me.
                            Data based on USDA Food and Nutrition Database.
                        </p>
                    </center>
                </div>
            </div>)
    }
}*/

ReactDOM.render(
    <button onClick={handleSearch}>Submit</button>,
    document.getElementById('searchButtonRoot'));
