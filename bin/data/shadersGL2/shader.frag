#version 120

// this is how we receive the texture
uniform sampler2DRect map0;
uniform sampler2DRect map1;
uniform sampler2DRect map2;
uniform sampler2DRect map3;
uniform sampler2DRect map4;
uniform sampler2DRect map5;
uniform sampler2DRect map6;
uniform sampler2DRect map7;
uniform sampler2DRect map8;
uniform sampler2DRect map9;
uniform sampler2DRect map10;
uniform sampler2DRect map11;
uniform sampler2DRect map12;
uniform sampler2DRect map13;
uniform sampler2DRect map14;
uniform sampler2DRect map15;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform int u_currframe;

varying vec2 texCoordVarying;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoisep(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float snoise(vec2 v){
    // Precompute values for skewed triangular grid
    const vec4 C = vec4(0.211324865405187,
                        // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  
                        // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  
                        // -1.0 + 2.0 * C.x
                        0.024390243902439); 
                        // 1.0 / 41.0

    // First corner (x0)
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    // Other two corners (x1, x2)
    vec2 i1 = vec2(0.0);
    i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
    vec2 x1 = x0.xy + C.xx - i1;
    vec2 x2 = x0.xy + C.zz;

    // Do some permutations to avoid
    // truncation effects in permutation
    i = mod289(i);
    vec3 p = permute(
            permute( i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(
                        dot(x0,x0), 
                        dot(x1,x1), 
                        dot(x2,x2)
                        ), 0.0);

    m = m*m ;
    m = m*m ;

    // Gradients: 
    //  41 pts uniformly over a line, mapped onto a diamond
    //  The ring size 17*17 = 289 is close to a multiple 
    //      of 41 (41*7 = 287)

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt(a0*a0 + h*h);
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

    // Compute final noise value at P
    vec3 g = vec3(0.0);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
    return 130.0 * dot(m, g);
}

float pmain(){

    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    vec3 color = vec3(0.0);
    vec2 pos = vec2(st*3.);

    float DF = 0.0;

    // Add a random position
    float a = 0.0;
    vec2 vel = vec2(u_time*.1);
    DF += snoise(pos+vel)*.25+.25;

    // Add a random position
    a = snoise(pos*vec2(cos(u_time*0.15),sin(u_time*0.1))*0.1)*3.1415;
    vel = vec2(cos(a),sin(a));
    DF += snoise(pos+vel)*.25+.25;

    float val = fract(DF);//smoothstep(.5,1.,fract(DF));
    return val;
    //color = vec3( smoothstep(.7,.75,fract(DF)) );

    //gl_FragColor = vec4(1.0-color,1.0);
}

float smain(){
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;

    vec3 color = vec3(0.0);

    // Scale the space in order to see the function
    st *= 10.;

    float val = snoise(st)*.5+.5;
    return val;
    //color = vec3(snoise(st)*.5+.5);

    //gl_FragColor = vec4(color,1.0);
}

void main()
{
    
    //gl_FragColor = texture2DRect(map0, texCoordVarying);
	//I'm expecting this between 0-1
	float val = pmain();
	int index = int(mod(floor(val * 16) + u_currframe, 16));

	vec4 frag = vec4(0);
	if (index == 0){
		frag = texture2DRect(map0, texCoordVarying);
	} else if (index == 1){
		frag = texture2DRect(map1, texCoordVarying);
	} else if (index == 2){
		frag = texture2DRect(map2, texCoordVarying);
	} else if (index == 3){
		frag = texture2DRect(map3, texCoordVarying);
	} else if (index == 4){
		frag = texture2DRect(map4, texCoordVarying);
	} else if (index == 5){
		frag = texture2DRect(map5, texCoordVarying);
	} else if (index == 6){
		frag = texture2DRect(map6, texCoordVarying);
	} else if (index == 7){
		frag = texture2DRect(map7, texCoordVarying);
	} else if (index == 8){
		frag = texture2DRect(map8, texCoordVarying);
	} else if (index == 9){
		frag = texture2DRect(map9, texCoordVarying);
	} else if (index == 10){
		frag = texture2DRect(map10, texCoordVarying);
	} else if (index == 11){
		frag = texture2DRect(map11, texCoordVarying);
	} else if (index == 12){
		frag = texture2DRect(map12, texCoordVarying);
	} else if (index == 13){
		frag = texture2DRect(map13, texCoordVarying);
	} else if (index == 14){
		frag = texture2DRect(map14, texCoordVarying);
	} else {
		frag = texture2DRect(map15, texCoordVarying);
	}

	//float c = fract(float(u_currframe) / 15.);
    gl_FragColor = frag;
	//pmain();
}