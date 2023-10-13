let particles = [];

let canvasHeight;
let canvasWidth;
let dipfield;

let backgroundImage;

let num = 2000;
let maxlife = 20000
let stride = 1;
let seispath = 'loppa';
let strokeColor = '#F3BEE3'

let density = 1;

let tintValue = 50
let trailValue = 10

let initFlag = false

dataLoaded = false;
let setupFlag=false; //flag to ensure that everything is loaded
let normflag = true; //toggle on/off left-right / inward flow
let seismicFlag = false; //toggles on/off seismic underlay

function normalizeAngle(angle) {
  angle += Math.PI
  return angle % (2 * Math.PI)
}

function normalizeAngleRight(angle) {
  angle += Math.PI
  return angle % (Math.PI)
}

function getIndex(row, column, numColumns) {
    return (row * numColumns) + column;
  }
  
function getElementAtRowColumn(array, row, column, numColumns) {
  const index = getIndex(row, column, numColumns);
  return array[index];
}


class PointClass {
    constructor(p, width, height) {

      this.startTime = millis();
      this.lifetime =  random(maxlife/2, maxlife);

      this.width = width
      this.height = height
      
      
      this.x_prev = p.x
      this.y_prev = p.y

      this.x = p.x
      this.y = p.y


    }
  
    update(a) {
        
        this.x_prev = this.x
        this.y_prev = this.y

        let new_a = a
        
        new_a = normalizeAngle(a)
        if (normflag){
          new_a = normalizeAngleRight(a)
        }
        this.x =  this.x + sin(new_a);        
        this.y = this.y - cos(new_a);

        
        if (millis() - this.startTime > this.lifetime){
          this.x = random(this.width)
          this.y = random(this.height)
          this.startTime = millis();
          this.lifetime =  random(maxlife/2, maxlife);
        }
        
        
        /*
        if (Math.abs(this.x - this.x_prev) < .001 || Math.abs(this.y - this.y_prev) < .001){
            
          this.x = random(this.width)
          this.y = random(this.height)

        }
        */

        
      }
    
  }
  


function preload() {

// Load necessary data asynchronously
let base = 'data/' + seispath + "/"
backgroundImage = loadImage(base + 'background.jpeg')
metadata = base + 'metadata.json'
vectors = base + 'dipfield.bin'

// Fetch both files
const promise1 = fetch(metadata);
const promise2 = fetch(vectors);

// Handle the responses when both requests are completed
Promise.all([promise1, promise2])
  .then(responses => {
    var response1 = responses[0].json();
    var response2 = responses[1].arrayBuffer();
    
    


    return Promise.all([response1, response2]);
  })
  .then(formatedResponses => {
    
    
    canvasHeight = formatedResponses[0].height
    canvasWidth = formatedResponses[0].width
    
    console.log("image size")
    console.log(canvasHeight,canvasWidth)



    dipfield = new Float32Array(formatedResponses[1])
    dataLoaded = true;
    

  })
  .catch(error => {
    console.error('Error:', error);
  });

  
}



function setup() {   
    
    
    if (!dataLoaded) {
        // If data is not loaded, wait for a certain time interval and check again
        setTimeout(setup, 100);
        return;
    }

    
    if (dataLoaded){
      setupFlag=true;
      
  
      let cnv = createCanvas(canvasWidth, canvasHeight);
      cnv.parent('canvasDiv')
      
      
      
      console.log("width,height")
      console.log(canvasWidth, canvasHeight)
      
      pixelDensity(density);
  
      for(let i = 0; i < num; i ++) {
          let particle = new PointClass(createVector(random(canvasWidth), random(canvasHeight)), canvasWidth, canvasHeight)
          particles.push(particle);
      }
      
      

    }


    
    
}

function draw() {
    
    if (!setupFlag){
        setTimeout(draw, 10);
        return;
    }

    if (seismicFlag){
      strokeWeight(2)
      let c = color(strokeColor)
      image(backgroundImage,0,0)
      stroke(c)
      
      

      tint(tintValue,trailValue);
      
      
    }else{
      strokeWeight(1)
      stroke(255)
      background(0,trailValue)
    }

 

    for(let i = 0; i < num; i++) {

        let p = particles[i];
        let a = (getElementAtRowColumn(dipfield,  parseInt(p.y), parseInt(p.x), canvasWidth))
        point(p.x, p.y)



        p.update(a)

        if(!onScreen(p)) {
            p.lifetime =  random(maxlife/2, maxlife);
            p.x = 0
            p.y = random(canvasHeight);
          }
        
      
    }
  
}



function onScreen(v) {
    return v.x >= 0 && v.x <= canvasWidth && v.y >= 0 && v.y <= canvasHeight;
  }


  function mapRange(value) {
    // Map the value from the range 0-100 % to the range 0-255
    return ((100 - value)/100) * 255;
  }

// Add an event listener to the button
buttonOrig.addEventListener('click', function() {
  normflag = false;
  buttonOrig.style.backgroundColor = "gray";
  buttonNorm.style.backgroundColor = "#f0f0f0";
  
  setup();
  draw();
});

buttonNorm.addEventListener('click', function() {
  normflag = true;
  buttonOrig.style.backgroundColor = "#f0f0f0";
  buttonNorm.style.backgroundColor = "gray";

  setup();
  draw();
});


const seismicSwitch = document.getElementById('toggleSeismic');

seismicSwitch.addEventListener('change', function() {
  if (this.checked) {
    // Switch is turned on
    seismicFlag = true;
    // Perform actions for the ON state
    setup();
    draw();
  } else {
    // Switch is turned off
    seismicFlag = false;
    // Perform actions for the OFF state
    setup();
    draw();
  }

});



  

const tintControls = document.getElementById('tint-group')
const tintSlider = document.getElementById("tint-slider");
const tintSliderValue = document.getElementById("tint-value");


const densitySlider = document.getElementById("pixelDensitySlider");
const densityValue = document.getElementById("pixelDensityValue");
  

const slider = document.getElementById("slider");
const sliderValue = document.getElementById("sliderValue");



//initialize slider values
function initValues(){
  if(initFlag === false){
  const notch = Math.round((tintValue / 255) * 100)
  tintSlider.value =  tintSlider.max - notch
  tintSliderValue.textContent = `alpha: ${notch} %`   
  
  densitySlider.value = 10
  densityValue.textContent = `Density: ${densitySlider.value / 10}`;


  slider.value = num / 1000
  sliderValue.textContent = `Particles: ${slider.value * 1000}`;

  initFlag = true;
  }
}



function toggleVisibility(element, mode){
  element.style.display = mode
}
  

toggleVisibility(tintControls,"none")

//toggle off tint-controls at start (no seismic to tint)


  
tintSlider.addEventListener("input", function() {

  const selectedNotch = tintSlider.value;
  tintValue = mapRange(tintSlider.value) 
  
  setup();
  draw();

  tintSliderValue.textContent = `alpha: ${100 - selectedNotch} %`;
});



densitySlider.addEventListener("input", function() {

  const selectedNotch = densitySlider.value ;
  density = densitySlider.value / 10;
  
  setup();
  draw();

  densityValue.textContent = `Density: ${selectedNotch / 10}`;
});




slider.addEventListener("input", function() {
  const selectedNotch = slider.value * 1000;
  num = selectedNotch
  setup();
  draw();
  sliderValue.textContent = `Particles: ${selectedNotch}`;
});





//toggle seismic on/off
const seismicSwitch = document.getElementById('toggleSeismic');
seismicSwitch.addEventListener('change', function() {
  if (this.checked) {
    // Switch is turned on
    seismicFlag = true;
    toggleVisibility(tintControls,"block")
    // Perform actions for the ON state
  } else {
    // Switch is turned off
    seismicFlag = false;
    toggleVisibility(tintControls,"none")
    // Perform actions for the OFF state
  }
  draw();
});





















const seismicSelector = document.getElementById('seisButtons')

function buttonToggle(buttons, activeName){
  for (let i = 0; i < buttons.children.length; i++){
    const child = buttons.children[i]
    child.classList.remove('active')
    if (activeName == String(child.id)){
      child.classList.toggle('active')
    }
  }
}


buttonToggle(seismicSelector,seispath)

for (let i = 0; i < seismicSelector.children.length; i++){
  const child = seismicSelector.children[i]
  
  //toggle active state for button on/off based on current button (initial state)
  
  //toggles and loads the dataset if it is not already selected
  child.addEventListener('click', function() {
    if (seispath != String(child.id)){
      seispath = String(child.id);
      dataLoaded = false;
      setupFlag = false;
      
      buttonToggle(seismicSelector,seispath)
      
      
      preload();
      setup();
      draw();

    }
  });

}


const colorPicker = document.getElementById('strokecolor')
colorPicker.value = strokeColor


colorPicker.addEventListener("input", function() {
  strokeColor = colorPicker.value
  setup();
  draw();
});


initValues()
