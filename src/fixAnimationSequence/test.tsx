/* eslint-disable @typescript-eslint/no-var-requires */
import { CSSProperties, useCallback, useState } from "react";
import { useAnimateSegments as useAnimateNew } from "./useAnimateSegments";
import { Button, IconButton, Slider } from "@mui/material";
import { AnimationPlaybackControls, AnimationScope, DynamicOption, MotionStyle, MotionValue, VisualElement, animateValue, animateVisualElement, motion, stagger, useAnimate, useMotionValue, visualElementStore } from "framer-motion";
import { useRef } from 'react';
import { SequenceOptions } from "./motion-types";
import { SmartDomSegmentWithTransition, SmartAnimationSequence, SegmentAnimationOptionsWithTransitionEnd } from "./createAnimationsFromSegments";
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const fm:{createVisualElement(element: HTMLElement | SVGElement):void} = require("..\\..\\node_modules\\framer-motion\\dist\\es\\animation\\utils\\create-visual-element.mjs");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fm2: { GroupPlaybackControls: any; } = require("..\\..\\node_modules\\framer-motion\\dist\\es\\animation\\GroupPlaybackControls.mjs");

const rotateEnd = "90deg";
const x:SegmentAnimationOptionsWithTransitionEnd = {
    transitionEnd:{
        fontStyle:"italic"
    },
    x:{
        duration:2,
    }
};
const x2:SegmentAnimationOptionsWithTransitionEnd = {
    transitionEnd:{
        rotate:rotateEnd, // this hack of using an existing motion value with the same value ensures that backgroundColor updates
        backgroundColor:"#FFFF00"
    },
    x:{
        duration:2,
        delay(index:number){
            return (index + 1 ) * 3;
        },
        onComplete(el:Element){
            console.log(`x complete ${el.innerHTML}`);
        }

    },
    rotate:{
        duration:6,
        onComplete(el:Element){
            console.log(`rotate complete ${el.innerHTML}`);
        }

    }
    
};

const singleSegmentXDelaySegment:SmartDomSegmentWithTransition = [
    "div", 
    { x:200 },
    {
        duration:3,
        delay(index){
            return index * 0.2;
        },
        
    }
]
const singleSegmentXDelaySequence:SmartAnimationSequence =  [
    singleSegmentXDelaySegment
];

const twoSegmentXDelaySequence:SmartAnimationSequence =  [
   singleSegmentXDelaySegment,
    ["div",{x:400},{duration:2}]
]

export function SingleSegmentXDelayFnComparison(){
    return <MultiElementComparison sequence={singleSegmentXDelaySequence}/>
}

export function TwoSegmentXDelayFnComparison(){
    return <MultiElementComparison sequence={twoSegmentXDelaySequence}/>
}


const multiSegmentTransitionEndSequence:SmartAnimationSequence = [
    ["div", { x:200 },x],
    ["div", { color:"#ead1dc" },{duration:2}],
    ["div", { x:400,rotate:rotateEnd },x2]
];

function createStaggerSequence(stagger:DynamicOption<number>){
    const staggeredSequence:SmartAnimationSequence = [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ["div", { x:200 },{x:{duration:2,delay:stagger as any}}],
        ["div", { color:"#ead1dc" },{duration:2}],
    ];
    return staggeredSequence;
}
export function StaggerCenterTest(){
    return <MultiElementComparison sequence={
        createStaggerSequence(stagger(1,{from:"center"}))
    }/>
}

export function StaggerFirstTest(){
    return <MultiElementComparison sequence={
        createStaggerSequence(stagger(1,{from:"first"}))
    }/>
}

export function StaggerLastTest(){
    return <MultiElementComparison sequence={
        createStaggerSequence(stagger(1,{from:"last"}))
    }/>
}

export function MultiSegmentTransitionEndComparison(){
    return <MultiElementComparison sequence={multiSegmentTransitionEndSequence}/>
}

export function MultiSegmentTransitionSequenceDelayComparison(){
    return <MultiElementComparison sequence={multiSegmentTransitionEndSequence} sequenceOptions={{delay:3}}/>
}

export function MultiSegmentTransitionSequenceDurationComparison(){
    return <MultiElementComparison sequence={multiSegmentTransitionEndSequence} sequenceOptions={{duration:10}}/>
}

export function MotionValueComparison(){
    const motionValue = useMotionValue(0);
    return <MultiElementComparison sequenceOptions={{delay:5,duration:10}} motionValueAndkey={{key:"x",value:motionValue}} sequence={
        [
            [motionValue,200,{duration:1,at:2}],
            ["div",{y:400},{duration:2}]
        ]
    }/>
}



export function SpringComparison(){
    return <MultiElementComparison sequence={
        [
            ["div",{x:200},{type:"spring",stiffness:1000,damping:100, duration:3}],
        ]
    }/>
}


const numElements = 5;
const yStart = 50;
const space = 20;

interface MotionValueAndKey {
    value:MotionValue,
    key:string
}

function MultipleElementDemo(props:{scope:AnimationScope,yStart:number,numElements:number,old:boolean,motionValueAndKey?:MotionValueAndKey}){
    const oldOrNew = props.old ? "old" : "new";
    const elements = new Array(props.numElements).fill(0).map((_,index) => {
        const style:CSSProperties = {position:"absolute",top:props.yStart + index*space};
        if(props.motionValueAndKey){
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const motionStyle = style as MotionStyle as any;
            motionStyle[props.motionValueAndKey.key] = props.motionValueAndKey.value;
            return <motion.div key={index} style={motionStyle}>{oldOrNew}</motion.div>
        }else{
            return <div key={index} style={style}>{oldOrNew}</div>
        }
        
    });
    return <div ref={props.scope}>
        {elements}
    </div>
}

export function BadDynamicAnimationOptionsTypescript(){
    const [scope, animate] = useAnimate();
    const [scope2, animate2] = useAnimate();
    
    const animateClickHandler = useCallback(() => {
        animate(
            scope.current,
            {x:100,y:100},
            {
                onComplete:() => console.log("x or y complete"),
            }
        );
        animate2(
            scope2.current,
            {x:100,y:100},
            {
                
                x:{
                    duration:2,
                    onComplete(){
                        console.log("x complete");
                    }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any,
                y:{
                    duration:5,
                    onComplete(){
                        console.log("y complete");
                    },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any
            }
        );
    }, [animate, animate2,scope,scope2]);
    return <>
        <Button onClick={animateClickHandler}>Animate</Button>  
        <div ref={scope}>***</div>
        <div ref={scope2}>***</div>
        </>
}

export function MultiElementComparison(props:{
    sequence:SmartAnimationSequence,
    motionValueAndkey?:MotionValueAndKey,
    sequenceOptions?:SequenceOptions
}){
    const [scope, animate] = useAnimateNew();
    const [scopeOld, animateOld] = useAnimate();
    
    const animateClickHandler = useCallback(() => {
        animate(props.sequence,props.sequenceOptions);
        animateOld(props.sequence as unknown,props.sequenceOptions);
    }, [animate, animateOld, props]);
    return <>
        <Button onClick={animateClickHandler}>Animate</Button>
        <MultipleElementDemo scope={scope as any} yStart={yStart} numElements={numElements} old={false} motionValueAndKey={props.motionValueAndkey}/>
        <MultipleElementDemo scope={scopeOld} yStart={yStart + space * (numElements + 1)} numElements={numElements} old={true} motionValueAndKey={props.motionValueAndkey}/>
        </>
}

export function ZIndexTest(){
    const [scope, animate] = useAnimateNew();
    const animateClickHandler = useCallback(() => {
        animate([
            [scope.current,{zIndex:1},{delay:2}],
            [scope.current,{x:200},{duration:1,delay:1}],
            [scope.current,{x:0},{duration:1}],
            [scope.current,{zIndex:-1}],
        ],{
            defaultTransition:{
                duration:100  // demonstrates that first segment does not affect the second.
            },
        })
    }, [animate, scope]);
    return <>
        <Button onClick={animateClickHandler}>Animate</Button>
        <div style={{position:"absolute",top:50,backgroundColor:"red", zIndex:-1}} ref={scope}>xxx</div>
        <div style={{position:"absolute",top:50,backgroundColor:"green", zIndex:0}}>xxx</div>
        </>
}

export function BadTransitionEnd(){
    const myRef = useRef(null);
    const animateClickHandler = useCallback(() => {
        fm.createVisualElement(myRef.current as unknown as HTMLElement);
        const visualElement = visualElementStore.get(myRef.current as unknown as HTMLElement)
        animateVisualElement(visualElement as VisualElement,{
            x:200,
            transitionEnd:{
                fontStyle:"italic",
                //x:200 // by adding this can force the re-render
            }
        })
    }, []);
    return <>
        <Button onClick={animateClickHandler}>Animate</Button>
        <div ref={myRef}>Hello</div>
        </>
}

class FakedAnimationPlaybackControls implements AnimationPlaybackControls{
    constructor(private realAnimationPlaybackControls:AnimationPlaybackControls, private fakeAnimationPlaybackControls:AnimationPlaybackControls){
    }
    public get time(): number {
        return this.realAnimationPlaybackControls.time;
    }
    public set time(value: number) {
        this.realAnimationPlaybackControls.time = value;
        this.fakeAnimationPlaybackControls.time = value;
    }
    public get speed(): number {
        return this.realAnimationPlaybackControls.speed;
    }
    public set speed(value: number) {
        this.realAnimationPlaybackControls.speed = value;
        this.fakeAnimationPlaybackControls.speed = value;
    }
    
    public get duration(): number {
        return this.realAnimationPlaybackControls.duration;
    }
    
    stop(){
        this.realAnimationPlaybackControls.stop();
        this.fakeAnimationPlaybackControls.stop();
    }
    play(){
        this.realAnimationPlaybackControls.play();
        this.fakeAnimationPlaybackControls.play();
    }
    pause(){
        this.realAnimationPlaybackControls.pause();
        this.fakeAnimationPlaybackControls.pause();
    }
    complete(){
        this.realAnimationPlaybackControls.complete();
        this.fakeAnimationPlaybackControls.complete();
    }
    cancel(){
        this.realAnimationPlaybackControls.cancel();
        this.fakeAnimationPlaybackControls.cancel();
    }
    then(onResolve: VoidFunction, onReject?: VoidFunction | undefined):Promise<void>{
        return this.realAnimationPlaybackControls.then(onResolve,onReject);
    }
}

// eslint-disable-next-line complexity
export function FakeAnimateExample(){
    const [scope, animate] = useAnimate();
    const [isPlaying,setIsPlaying] = useState(false);
    const [stopped,setIsStopped] = useState(false);
    const animationPlaybackControlsRef = useRef<AnimationPlaybackControls|undefined>();
    const fakeAnimationPlaybackControlsRef = useRef<AnimationPlaybackControls|undefined>();
    const durationRef = useRef<number|undefined>();
    const [time,setTime] = useState(0);
    const [speed,setSpeed] = useState(0);
    const setTimeFromControls = useCallback(() => {
        setTime(animationPlaybackControlsRef.current?.time || 0);
    },[])
    const playClickHandler = useCallback(() => {
        if(animationPlaybackControlsRef.current === undefined){
            
            const fakeXAnimation = animateValue({
                keyframes:[0,1],
                duration:11000,// 10000,
                //delay:1000,
                /* onUpdate:(v:number) => {
                    console.log("fake x update",v);
                }, */
                onComplete:() => {
                    console.log("first completed");
                },

            });
            const fakeYAnimation = animateValue({
                keyframes:[0,1],
                duration:4000,
                delay:0,
                /* onUpdate:(v:number) => {
                    console.log("fake y update",v);
                }, */
                onComplete:() => {
                    console.log("y completed");
                },
            });

            const fakeXAnimation2 = animateValue({
                keyframes:[0,1],
                duration:16000,//5000,
                //delay:11000,
                /* onUpdate:(v:number) => {
                    console.log("fake x2 update",v);
                }, */
                onComplete:() => {
                    console.log("second x completed");
                },

            });

            const fakeGrouping = new fm2.GroupPlaybackControls([fakeXAnimation,fakeYAnimation,fakeXAnimation2])
            fakeGrouping.then(() => {
                // would use the setTarget
                scope.current.style.backgroundColor = "red";
            });
            fakeAnimationPlaybackControlsRef.current = fakeGrouping;
            

            const realAnimationPlaybackControls = animate([
                [scope.current,{x:600,y:400},{x:{duration:10,delay:1},y:{duration:4}}],
                [scope.current,{x:200},{duration:5,delay:0}],
            ],{repeat:2,repeatType:"reverse",repeatDelay:2});
            animationPlaybackControlsRef.current = new FakedAnimationPlaybackControls(realAnimationPlaybackControls,fakeGrouping);
            durationRef.current = animationPlaybackControlsRef.current.duration;
            setSpeed(animationPlaybackControlsRef.current.speed);
            
        }else{
            animationPlaybackControlsRef.current.play();
        }
        setIsPlaying(true);
    }, [animate,scope]);
    const stopClickHandler = useCallback(() => {
        animationPlaybackControlsRef.current?.stop();
        //setTimeFromControls();
        setIsStopped(true);
    },[/* setTimeFromControls */]);
    const completeClickHandler = useCallback(() => {
        animationPlaybackControlsRef.current?.complete();
        //setTimeFromControls();
    },[/* setTimeFromControls */]);
    const pauseClickHandler = useCallback(() => {
        animationPlaybackControlsRef.current?.pause();
        setIsPlaying(false);
        //setTimeFromControls();
    },[/* setTimeFromControls */]);
    const cancelClickHandler = useCallback(() => {
        animationPlaybackControlsRef.current?.cancel();
        setIsPlaying(false);
        //setTimeFromControls();
    },[/* setTimeFromControls */]);
    return <>
        <div style={{overflow:"hidden"}} ref={scope}>***</div>
        <div style={{position:"absolute",bottom:100}}>
            <IconButton disabled={isPlaying || stopped} onClick={playClickHandler}>
                <PlayCircleIcon/>
            </IconButton>
            <IconButton disabled={!isPlaying || stopped} onClick={pauseClickHandler}>
                <PauseCircleIcon/>
            </IconButton>
            <IconButton disabled={stopped} onClick={stopClickHandler}>
                <StopCircleIcon/>
            </IconButton>
            <IconButton disabled={!isPlaying || stopped}  onClick={completeClickHandler}>
                <ArrowForwardIcon/>
            </IconButton>
            <IconButton onClick={cancelClickHandler}>
                <CancelIcon/>
            </IconButton>
            <div>Time</div>
            <Slider value={time} max={durationRef.current === undefined ? 0 : durationRef.current} disabled={stopped} onChange={(evt,newValue) => {
                newValue = newValue as number
                setTime(newValue);
                (animationPlaybackControlsRef.current as AnimationPlaybackControls).time = newValue;
            }}/>
            <div>Speed</div>
            <Slider value={speed} max={durationRef.current === undefined ? 0 :10} disabled={stopped} onChange={(evt,newValue) => {
                newValue = newValue as number
                setSpeed(newValue);
                (animationPlaybackControlsRef.current as AnimationPlaybackControls).speed = newValue;
            }}/>
            
        </div>
        </>
}

// eslint-disable-next-line complexity
export function OldControls(){
    const [scope, animate] = useAnimate();
    const [isPlaying,setIsPlaying] = useState(false);
    const [stopped,setIsStopped] = useState(false);
    const animationPlaybackControlsRef = useRef<AnimationPlaybackControls|undefined>();
    const durationRef = useRef<number|undefined>();
    const [time,setTime] = useState(0);
    const [speed,setSpeed] = useState(0);
    const setTimeFromControls = useCallback(() => {
        setTime(animationPlaybackControlsRef.current?.time || 0);
    },[])
    const playClickHandler = useCallback(() => {
        if(animationPlaybackControlsRef.current === undefined){
            animationPlaybackControlsRef.current = animate([
                ["div",{x:600,y:400},{duration:10,delay:1}],
                ["div",{backgroundColor:"#D22B2B"},{duration:5,delay:0}],
            ]);
            durationRef.current = animationPlaybackControlsRef.current.duration;
            setSpeed(animationPlaybackControlsRef.current.speed);
        }else{
            animationPlaybackControlsRef.current.play();
        }
        setIsPlaying(true);
    }, [animate]);
    const stopClickHandler = useCallback(() => {
        animationPlaybackControlsRef.current?.stop();
        setTimeFromControls();
        setIsStopped(true);
    },[setTimeFromControls]);
    const completeClickHandler = useCallback(() => {
        animationPlaybackControlsRef.current?.complete();
        setTimeFromControls();
    },[setTimeFromControls]);
    const pauseClickHandler = useCallback(() => {
        animationPlaybackControlsRef.current?.pause();
        setIsPlaying(false);
        setTimeFromControls();
    },[setTimeFromControls]);
    const cancelClickHandler = useCallback(() => {
        animationPlaybackControlsRef.current?.cancel();
        setIsPlaying(false);
        setTimeFromControls();
    },[setTimeFromControls]);
    return <>
        <div style={{position:"absolute",bottom:100}}>
            <Button disabled={isPlaying || stopped} onClick={playClickHandler}>Play</Button>
            <Button disabled={!isPlaying || stopped} onClick={pauseClickHandler}>Pause</Button>
            <Button disabled={stopped} onClick={stopClickHandler}>Stop</Button>
            <Button disabled={!isPlaying || stopped}  onClick={completeClickHandler}>Complete</Button>
            <Button onClick={cancelClickHandler}>Cancel</Button>
            <Slider value={time} max={durationRef.current === undefined ? 0 : durationRef.current} disabled={stopped} onChange={(evt,newValue) => {
                newValue = newValue as number
                setTime(newValue);
                (animationPlaybackControlsRef.current as AnimationPlaybackControls).time = newValue;
            }}/>
            <Slider value={speed} max={durationRef.current === undefined ? 0 :10} disabled={stopped} onChange={(evt,newValue) => {
                newValue = newValue as number
                setSpeed(newValue);
                (animationPlaybackControlsRef.current as AnimationPlaybackControls).speed = newValue;
            }}/>
        </div>
        <MultipleElementDemo scope={scope} yStart={yStart} numElements={numElements} old={true}/>
        </>
}

export function UnmountTest(){
    const [unmount,setUnmount] = useState(false);
    return <>
        <Button onClick={() => setUnmount(true)}>Unmount</Button>
        {!unmount && <MultiElementComparison sequence={multiSegmentTransitionEndSequence} />}
    </>
}

export function FixAnimationTest(){
    return <UnmountTest/>
}