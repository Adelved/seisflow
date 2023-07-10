let particles = [];
let xpos = [];
let ypos = [];
let canvasHeight;
let canvasWidth;
let dipfield;


let num = 5000;
let stride = 1;


dataLoaded = false;

let setupFlag=false; //flag to ensure that everything is loaded


let normflag = false; //toggle on/off left-right / inward flow

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
        this.x =  this.x - cos(new_a);          
        this.y = this.y + sin(new_a);

        

        if (Math.abs(this.x - this.x_prev) < .01 || Math.abs(this.y - this.y_prev) < .01){
            
          this.x = random(this.width)
          this.y = random(this.height)

      }

        

        /*
        if (deltaTime >= this.lifetime) {
          


            this.startTime = millis(); // Start time of the object's existence
            this.lifetime = 100; // Lifetime duration in milliseconds
        }
        */
        
      }
    
  }
  

let backgroundImage;

function preload() {
// Load necessary data asynchronously
backgroundImage = loadImage('topseis.jpeg')
metadata = 'metadata.json'
vectors = 'dip_topseis.bin'

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
    
    
    console.log(canvasHeight,canvasWidth)
    
    dipfield = new Float32Array(formatedResponses[1])
    console.log(dipfield)
    
    dataLoaded = true;
  })
  .catch(error => {
    console.error('Error:', error);
  });

  
}



function setup() {   

    console.log(dataLoaded)
    if (!dataLoaded) {
        // If data is not loaded, wait for a certain time interval and check again
        setTimeout(setup, 1);
        return;
      }
    setupFlag=true;
    const density = 3;
    createCanvas(canvasWidth, canvasWidth);

    console.log(canvasWidth)
    
    pixelDensity(density);

    for(let i = 0; i < num; i ++) {
        let particle = new PointClass(createVector(random(canvasHeight), random(canvasWidth)), canvasWidth, canvasHeight)
        particles.push(particle);
    }
    
    

    
    
    }




function draw() {
    line(0, canvasHeight - 79, canvasWidth, canvasHeight - 79);
    if (!setupFlag){
        setTimeout(draw, 10);
        return;
    }

    if (seismicFlag){
      stroke(251,72,150)
      image(backgroundImage,0,0)
      tint(255,10)
    }else{
      stroke(255)
      background(0,10)
    }

    //background(10);
    

    for(let i = 0; i < num; i++) {

        let p = particles[i];
        let a = (getElementAtRowColumn(dipfield, parseInt(p.x), parseInt(p.y), canvasWidth))
        point(p.y, p.x)



        p.update(a)

        if(!onScreen(p)) {
            p.x = random(canvasWidth);
            p.y = random(canvasHeight);
          }
        
      
    }
}



function onScreen(v) {
    return v.x >= 0 && v.x <= canvasWidth && v.y >= 0 && v.y <= canvasHeight;
  }


// Access the button element
const buttonOrig = document.getElementById('buttonOrig');
const buttonNorm = document.getElementById('buttonNorm');


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
  } else {
    // Switch is turned off
    seismicFlag = false;
    // Perform actions for the OFF state
  }
  setup();
  draw();
});


toggleSeismic

const slider = document.getElementById("slider");
const sliderValue = document.getElementById("sliderValue");

slider.addEventListener("input", function() {

  const selectedNotch = slider.value * 1000;
  num = selectedNotch
  setup();
  draw();

  sliderValue.textContent = `Num Particles: ${selectedNotch}`;
});
