let particles = [];
let xpos = [];
let ypos = [];
let canvasHeight;
let canvasWidth;
let dipfield;


let num = 5000;

let stride = 1;


dataLoaded = false;

let setupFlag=false;
let normflag = false;

function normalizeAngle(angle) {
  angle += Math.PI
  return angle % (2 * Math.PI)
}

function normalizeAngleRight(angle) {
  angle += Math.PI
  return angle % (Math.PI)
}

function getIndex(row, column, numColumns) {
    return row * numColumns + column;
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

      this.startTime = millis(); // Start time of the object's existence
      this.lifetime = 100; // Lifetime duration in milliseconds
      
    }
  
    update(a) {
        let currentTime = millis();
        let deltaTime = currentTime - this.startTime;

        
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
  



function preload() {
// Load necessary data asynchronously

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
        setTimeout(setup, 100);
        return;
      }
    setupFlag=true;
    const density = 5;
    createCanvas(canvasWidth, canvasHeight);
    console.log(density)
    pixelDensity(density);
    for(let i = 0; i < num; i ++) {
        let particle = new PointClass(createVector(random(canvasWidth), random(canvasHeight)), canvasWidth, canvasHeight)
        particles.push(particle);
    }
    stroke(255)

    }




function draw() {
    if (!setupFlag){
        setTimeout(draw, 10);
        return;
    }
    background(0,10);
    for(let i = 0; i < num; i++) {

        let p = particles[i];
        let a = (getElementAtRowColumn(dipfield,parseInt(p.x),parseInt(p.y),width))
        
        
        point(p.y,p.x)
        p.update(a)

        if(!onScreen(p)) {
            p.x = random(width);
            p.y = random(height);
          }
        
      
    }
}





function onScreen(v) {
    return v.x >= 0 && v.x <= width && v.y >= 0 && v.y <= height;
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


const slider = document.getElementById("slider");
const sliderValue = document.getElementById("sliderValue");

slider.addEventListener("input", function() {

  const selectedNotch = slider.value * 1000;
  num = selectedNotch
  setup();
  draw();

  sliderValue.textContent = `Num Particles: ${selectedNotch}`;
});
