let particles = [];
let xpos = [];
let ypos = [];
let canvasHeight;
let canvasWidth;
let dipfield;
let num = 10000;

let stride = 1;


dataLoaded = false;
let setupFlag=false;

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
      this.lifetime = 3000; // Lifetime duration in milliseconds
      
    }
  
    update(a) {
        let currentTime = millis();
        let deltaTime = currentTime - this.startTime;

        

        this.x_prev = this.x
        this.y_prev = this.y


        this.x =  this.x - cos(a);
        this.y = this.y + sin(a);

        if (Math.abs(this.x - this.x_prev) < .01 || Math.abs(this.y - this.y_prev) < 0.01){
            this.x = random(this.width)
            this.y = random(this.height)

        }
    
        
        /* Check if the object's lifetime has expired
        if (deltaTime >= this.lifetime) {
            this.x = random(this.width)
            this.y = random(this.height)

            this.startTime = millis(); // Start time of the object's existence
            this.lifetime = 3000; // Lifetime duration in milliseconds
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
        setTimeout(setup, 1);
        return;
      }
    setupFlag=true;
    
    createCanvas(canvasWidth, canvasHeight);
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
    background(0,5);
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