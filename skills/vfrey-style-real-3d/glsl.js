// Shaders for the vfrey real 3D style (vfrey-style-real-3d). Copy next to your scene source and `import * as G from "./glsl.js"`.
// Every surface is made from 3D simplex noise on the unit-sphere normal: seamless, and no image files (the network is blocked while rendering).

export const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*snoise(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=0.5; } return s; }
float fbm3(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<3;i++){ s+=a*snoise(p); p=p*2.1+vec3(4.1,2.2,7.7); a*=0.5; } return s; }
`;

// A unit sphere: object-space normal for the noise, view-space normal and view vector for the light (stable at any distance).
export const BODY_VS = /* glsl */ `
varying vec3 vObj; varying vec3 vN; varying vec3 vV;
void main(){
  vObj = normalize(position);
  vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

// A lit body. uLight is the light direction in VIEW space. uType: 0 a living world (sea, land, ice, moving cloud, night lights),
// 1 a rocky world (two tones and a polar cap), 2 a banded gas world. uA and uB are its two main colours. Add a branch for your own.
export const BODY_FS = /* glsl */ `
precision highp float;
uniform vec3 uLight; uniform float uTime; uniform int uType; uniform float uAmb; uniform vec3 uA; uniform vec3 uB;
varying vec3 vObj; varying vec3 vN; varying vec3 vV;
${NOISE}
const float PI=3.14159265;
void main(){
  vec3 n=normalize(vObj); vec3 N=normalize(vN); vec3 V=normalize(vV);
  float nl=dot(N,uLight);
  vec3 alb=vec3(0.5); float spec=0.0; vec3 emis=vec3(0.0); float rimK=0.0; vec3 rimC=vec3(0.5,0.7,1.0); float shin=40.0;
  if(uType==0){
    float h=fbm(n*2.1)*0.5+0.5; float land=smoothstep(0.50,0.54,h);
    vec3 sea=mix(uA*0.15,uA,smoothstep(0.25,0.5,h));
    vec3 lc=mix(uB,uB*vec3(1.9,1.0,0.9),smoothstep(0.56,0.78,h));
    float ice=smoothstep(0.80,0.92,abs(n.y)+fbm3(n*4.0)*0.07);
    alb=mix(sea,lc,land); alb=mix(alb,vec3(0.93,0.96,1.0),ice);
    float c=fbm(n*3.1+vec3(uTime*0.012,0.0,uTime*0.004))*0.5+0.5; c=smoothstep(0.50,0.76,c);
    alb=mix(alb,vec3(1.0),c*0.92);
    spec=(1.0-land)*(1.0-c)*(1.0-ice)*0.9; shin=70.0;
    float city=land*(1.0-c)*smoothstep(0.62,0.72,fbm(n*11.0)*0.5+0.5)*smoothstep(0.82,0.5,abs(n.y));
    emis=vec3(1.0,0.72,0.3)*city*0.9;
    rimK=1.0; rimC=vec3(0.28,0.55,1.0);
  } else if(uType==1){
    float h=fbm(n*2.6)*0.5+0.5; float d=fbm3(n*7.0)*0.5+0.5;
    alb=mix(uA,uB,smoothstep(0.35,0.75,h)*0.8);
    alb=mix(alb,uA*1.25,smoothstep(0.55,0.8,d)*0.35);
    alb=mix(alb,vec3(0.95,0.93,0.9),smoothstep(0.88,0.94,abs(n.y)+h*0.03));
    rimK=0.35; rimC=uA;
  } else {
    float w=snoise(vec3(n.x*3.0,n.y*11.0,n.z*3.0)); float w2=snoise(vec3(n.x*9.0,n.y*30.0,n.z*9.0));
    float bi=n.y*8.5+0.28*w+0.07*w2; float band=0.5+0.5*sin(bi*PI); float band2=0.5+0.5*sin(bi*PI*2.3+1.0);
    alb=mix(uA,uB,band); alb=mix(alb,vec3(0.93,0.88,0.78),band2*0.35*(1.0-band)); alb*=0.9+0.2*w2;
    rimK=0.25; rimC=uA;
  }
  float diff=max(nl,0.0);
  vec3 col=alb*(diff*1.12+uAmb)+emis*(1.0-smoothstep(-0.2,0.15,nl));           // night lights only on the dark side
  vec3 R=reflect(-uLight,N); col+=vec3(1.0,0.95,0.85)*spec*pow(max(dot(R,V),0.0),shin)*diff*0.9;   // glint on the sea
  float fr=pow(1.0-max(dot(N,V),0.0),3.0); col+=rimC*fr*rimK*smoothstep(-0.30,0.55,nl);            // air at the rim
  gl_FragColor=vec4(col,1.0);
}`;

// A star: an animated noise ramp with limb darkening. Keep it saturated (orange first, white only at peaks) or bloom turns it cream.
export const STAR_BODY_FS = /* glsl */ `
precision highp float;
uniform float uTime;
varying vec3 vObj; varying vec3 vN; varying vec3 vV;
${NOISE}
void main(){
  vec3 n=normalize(vObj); vec3 N=normalize(vN); vec3 V=normalize(vV); float t=uTime;
  float g1=snoise(n*5.0+vec3(0.0,0.0,t*0.35))*0.5+0.5; float g2=snoise(n*14.0+vec3(t*0.22,0.0,0.0))*0.5+0.5; float g3=fbm3(n*2.2+vec3(0.0,t*0.06,0.0))*0.5+0.5;
  float heat=clamp(0.52*g1+0.30*g2+0.5*g3-0.12,0.0,1.0);
  vec3 c0=vec3(0.62,0.1,0.01), c1=vec3(1.0,0.42,0.04), c2=vec3(1.0,0.68,0.16), c3=vec3(1.0,0.88,0.5);
  vec3 col=mix(c0,c1,smoothstep(0.15,0.5,heat)); col=mix(col,c2,smoothstep(0.45,0.75,heat)); col=mix(col,c3,smoothstep(0.75,1.0,heat));
  col*=0.42+0.78*pow(max(dot(N,V),0.0),0.55);
  gl_FragColor=vec4(col*0.82,1.0);
}`;

// An additive shell just outside a body (scale 1.04): the glow of its air, on the lit side only.
export const ATMO_FS = /* glsl */ `
precision highp float;
uniform vec3 uLight; uniform vec3 uColor; uniform float uK; uniform float uPow;
varying vec3 vObj; varying vec3 vN; varying vec3 vV;
void main(){
  float f=pow(1.0-abs(dot(normalize(vN),normalize(vV))),uPow);
  gl_FragColor=vec4(uColor*f*smoothstep(-0.35,0.5,dot(normalize(vN),uLight))*uK,1.0);
}`;

// A glow billboard: a plane that always faces the camera and is never smaller than uMinPx on screen, with optional noise rays.
export const GLOW_VS = /* glsl */ `
uniform vec2 uRes; uniform float uWorldR; uniform float uMinPx;
varying vec2 vUv;
void main(){
  vec4 c=modelViewMatrix*vec4(0.0,0.0,0.0,1.0); vec4 cc=projectionMatrix*c;
  float ppu=projectionMatrix[1][1]*0.5*uRes.y/max(-c.z,1e-9);
  float rpx=max(uWorldR*ppu,uMinPx);
  cc.xy+=position.xy*rpx*2.0/uRes*cc.w;
  vUv=position.xy; gl_Position=cc;
}`;
export const GLOW_FS = /* glsl */ `
precision highp float;
uniform vec3 uColor; uniform float uK; uniform float uPow; uniform float uAlpha; uniform float uRays; uniform float uTime;
varying vec2 vUv;
${NOISE}
void main(){
  float r=length(vUv); if(r>1.0) discard;
  float ang=atan(vUv.y,vUv.x);
  float ray=1.0+uRays*(snoise(vec3(cos(ang)*2.2,sin(ang)*2.2,uTime*0.12+r))*0.9+0.5*snoise(vec3(cos(ang)*7.0,sin(ang)*7.0,uTime*0.3+3.0)));
  float a=pow(1.0-r,uPow)*uK*uAlpha*max(ray,0.0);
  gl_FragColor=vec4(uColor*(a+smoothstep(0.18,0.0,r)*0.8*uAlpha),1.0);
}`;

// Sky: points and a faint noise band that use only the camera's rotation and sit at the far plane, so they never clip.
export const SKY_VS = /* glsl */ `
attribute float aSize; attribute vec3 aCol; varying vec3 vCol;
void main(){
  vec4 clip=projectionMatrix*vec4(mat3(viewMatrix)*position,1.0); clip.z=clip.w*0.99999;
  gl_Position=clip; gl_PointSize=aSize; vCol=aCol;
}`;
export const SKY_FS = /* glsl */ `
precision highp float; varying vec3 vCol;
void main(){ vec2 q=gl_PointCoord*2.0-1.0; float r=length(q); if(r>1.0) discard; gl_FragColor=vec4(vCol*pow(1.0-r,1.6),1.0); }`;
export const NEB_VS = /* glsl */ `
varying vec3 vDir;
void main(){ vDir=position; vec4 clip=projectionMatrix*vec4(mat3(viewMatrix)*position,1.0); clip.z=clip.w*0.99999; gl_Position=clip; }`;
export const NEB_FS = /* glsl */ `
precision highp float; varying vec3 vDir; uniform float uK;
${NOISE}
void main(){
  vec3 d=normalize(vDir);
  float band=exp(-pow(dot(d,normalize(vec3(0.25,0.9,-0.35)))*3.2,2.0));
  float n=fbm(d*2.4)*0.5+0.5; float m=fbm3(d*5.0+3.0)*0.5+0.5;
  float v=band*smoothstep(0.35,0.85,n)*(0.5+0.8*m);
  gl_FragColor=vec4((mix(vec3(0.07,0.09,0.2),vec3(0.30,0.20,0.36),m)*v*1.5+vec3(0.006,0.008,0.02))*uK,1.0);
}`;

// Dust that wraps around the camera in a box of side uB, drawn as line segments stretched by the camera's velocity: speed you can see.
export const DUST_VS = /* glsl */ `
attribute vec3 aBase; attribute float aEnd; uniform vec3 uCam; uniform float uB; uniform vec3 uStreak; varying float vA;
void main(){
  vec3 rel=mod(aBase*uB-uCam+uB*0.5,uB)-uB*0.5; rel-=uStreak*aEnd;
  float dist=length(rel);
  vA=(1.0-aEnd*0.9)*smoothstep(uB*0.5,uB*0.25,dist)*smoothstep(0.0,uB*0.06,dist);
  gl_Position=projectionMatrix*vec4(mat3(viewMatrix)*rel,1.0);
}`;
export const DUST_FS = /* glsl */ `
precision highp float; uniform float uAlpha; varying float vA;
void main(){ gl_FragColor=vec4(vec3(0.7,0.82,1.0)*vA*uAlpha,1.0); }`;
