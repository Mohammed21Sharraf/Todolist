const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

// The code below tells us that our app is generated using Express to use EJS as its view enigine
app.set('view engine', 'ejs');

// setting up mongoose database
mongoose.connect("mongodb+srv://admin-sharraf:Test123@cluster0.8scpe.mongodb.net/todolistDB");

const itemsSchma = {
  name: String
}
const Item = mongoose.model("Item", itemsSchma);
const item1 = new Item ({
  name: "Cooking"
});
const item2 = new Item ({
  name: "Eating"
});
const item3 = new Item ({
  name: "Sleeping"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchma]
}
const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err){
          if (err) {
            console.log("Error");
          } else {
            console.log("Success");
          }
        });
        res.redirect("/")
      } else {
        // Express is going to look inside a folder called views and its going to look for a file called list.ejs , then we render list
        // and then  pass a JS object which has a key value pair where key will be a variable in the form of EJS marker and the value
        // will be that one we are changing
        res.render("list", {listTitle: "Today", newAddedItems: foundItems});
      }
  });

});
// Custom List
app.get("/:customList", function (req, res) {
  const customListName = _.capitalize(req.params.customList)

  List.findOne({name: customListName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const list = new List ({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // Show an existing list
        res.render("list", {listTitle: foundList.name, newAddedItems: foundList.items})
      }
    }
  });

});


app.post("/", function(req, res) {

  const nameOfItem = req.body.NewItem;
  const listName = req.body.List;

  const itemName = new Item ({
    name: req.body.NewItem
  });

  if (listName === "Today") {
    itemName.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listName},  function(err, foundList) {
      foundList.items.push(itemName);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItem, function(err) {
      if (err) {
        console.log(err);
    } else {
      res.redirect("/");
    }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, function(err, foundList) {
      if(!err) {
        res.redirect("/" + listName);
      }
    });
  }


});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("server started on port 3000");
});
