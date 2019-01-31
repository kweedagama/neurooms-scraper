const fs = require("fs");
const path = require("path");

getClasses = () => {
  const classes = fs.readFileSync(path.resolve(`./output/classes.json`));
  classes.map(c => {
    console.log(c);
  });
};
getClasses();
return;
