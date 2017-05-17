#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
    loadedImages = false;
    loadedToShader = false;
    numShaderTexs = 16;
    loadingFrame = 1;
    nextShaderTex = 0;
    ofSetLogLevel(OF_LOG_VERBOSE);
    
#ifdef TARGET_OPENGLES
    ofLogNotice("VideoPerlin", "using openglES");
    shader.load("shadersES2/shader");
#else
    if(ofIsGLProgrammableRenderer()){
        ofLogNotice("VideoPerlin", "using opengl3");
        shader.load("shadersGL3/shader");
    }else{
        ofLogNotice("VideoPerlin", "using opengl2");
        shader.load("shadersGL2/shader");
    }
#endif
    
    img.loadImage("img.jpg");
    
    plane.set(800, 600, 10, 10);
    plane.mapTexCoords(0, 0, img.getWidth(), img.getHeight());
    
    fingerMovie.load("movies/fingers.mov");
    fingerMovie.play();
    
//    fingerMovie.nextFrame()
//    fingerMovie.setLoopState(OF_LOOP_NORMAL);
//    fingerMovie.play();
    
}

//--------------------------------------------------------------
void ofApp::update(){
    fingerMovie.update();
    
    if (fingerMovie.isFrameNew()){
        ofLogVerbose("VideoPerlin") <<
            "loading frame " << fingerMovie.getCurrentFrame() << " from video";
        frames[nextShaderTex] = ofTexture(fingerMovie.getTexture());
        if (nextShaderTex == numShaderTexs - 1){
            if (!loadedImages){
                ofLogNotice("VideoPerlin") << "done loading frames from video";
                loadedImages = true;
            }
        }
    }
//    if (!loadedImages){
//        ofLogNotice("VideoPerlin") << "loading frames from video";
//        fingerMovie.firstFrame();
//        for(int i = 0; i < numFrames; i++){
//            do {
//                fingerMovie.update();
//            } while (!fingerMovie.isFrameNew());
//            frames[i] = ofTexture(fingerMovie.getTexture());
//            fingerMovie.nextFrame();
//        }
//        ofLogNotice("VideoPerlin") << "loaded frames from video";
//        loadedImages = true;
//    }
}

//--------------------------------------------------------------
void ofApp::draw(){
    
    // start our shader, in our OpenGL3 shader this will automagically set
    // up a lot of matrices that we want for figuring out the texture matrix
    // and the modelView matrix
    shader.begin();
    
    if (loadedImages && !loadedToShader){
        ofLogNotice("VideoPerlin") << "loading frames into shader";
        for(int i = 0; i < numShaderTexs; i++){
            shader.setUniformTexture("tex" + ofToString(i), frames[i], i);
        }
        ofLogNotice("VideoPerlin") << "loaded frames into shader";
        loadedToShader = true;
    } else if (loadedImages && fingerMovie.isFrameNew()){
        ofLogVerbose("VideoPerlin") <<
            "loading frame " << fingerMovie.getCurrentFrame() <<
            " into shader at tex" << nextShaderTex;
        shader.setUniformTexture("tex" + ofToString(nextShaderTex), frames[nextShaderTex], nextShaderTex);
    }
    
    shader.setUniform1i("u_currframe", nextShaderTex);
    
    if (fingerMovie.isFrameNew()){
        nextShaderTex = ((nextShaderTex + 1) % numShaderTexs);
    }
    
    //ofLogVerbose("VideoPerlin") << "show frame " << (ofGetFrameNum() % numFrames);
    
//    ofLogVerbose("VideoPerlin") << "new frame: " << (fingerMovie.isFrameNew() ? "true" : "false") << " #" << fingerMovie.getCurrentFrame();
//    if (fingerMovie.getCurrentFrame() >= 0){
//        int frameIndex = fingerMovie.getCurrentFrame() % numFrames;
//        
//        if (fingerMovie.isFrameNew()){
//            //frames[frameIndex] = fingerMovie.getTexture();
//    //        if (!loadedImages){
//    //            frames[fingerMovie.getCurrentFrame() % numFrames] =
//    //        }
//            string texID = "tex" + ofToString(frameIndex);
//            ofLogVerbose("VideoPerlin") << "assigning to " << texID;
//            shader.setUniformTexture(texID, fingerMovie.getTexture(), frameIndex);
//        }
//        
//    //    for(int i = 0; i < numFrames; i++){
//    //        string texID = "tex" + ofToString(i);
//    //        shader.setUniformTexture(texID, frames[i], i + 1);
//    //    }
//        int prevFrame = (fingerMovie.getCurrentFrame() < (numFrames - 2) ? fingerMovie.getTotalNumFrames() + numFrames - 2 : fingerMovie.getCurrentFrame()) - numFrames + 2;
//        int prevFrameIndex = (prevFrame % numFrames);
//        ofLogVerbose("VideoPerlin") << "using index " << prevFrameIndex;
//        shader.setUniform1i("u_currframe", prevFrameIndex);//(frameIndex == 0 ? (numFrames - 1) : (frameIndex - 1)));
//    }
    
    //fingerMovie.getTexture().bind();
    
    // bind our texture. in our shader this will now be tex0 by default
    // so we can just go ahead and access it there.
    //img.getTextureReference().bind();
    
    // get mouse position relative to center of screen
    float mousePosition = ofMap(mouseX, 0, ofGetWidth(), 1.0, -1.0, true);
#ifndef TARGET_OPENGLES
    // when texture coordinates are normalised, they are always between 0 and 1.
    // in GL2 and GL3 the texture coordinates are not normalised,
    // so we have to multiply the normalised mouse position by the plane width.
    mousePosition *= plane.getWidth();
#endif
    
    shader.setUniform2f("u_resolution", ofGetWidth(), ofGetHeight());
    shader.setUniform2f("u_mouse", mouseX, mouseY);
    shader.setUniform1f("u_time", ofGetElapsedTimef());// ofGetElapsedTimeMillis());
    
    ofPushMatrix();
    ofTranslate(ofGetWidth()/2, ofGetHeight()/2);
    
    plane.draw();
    
    ofPopMatrix();
    
    shader.end();
    
    //fingerMovie.getTexture().unbind();
    //img.getTextureReference().unbind();
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){

}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){

}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseEntered(int x, int y){

}

//--------------------------------------------------------------
void ofApp::mouseExited(int x, int y){

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}
