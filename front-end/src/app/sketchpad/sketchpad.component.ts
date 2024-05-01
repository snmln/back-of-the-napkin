

import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  AfterViewInit
} from "@angular/core";
import { ChatService } from "../services/chat.service";
import { fromEvent, combineLatest, EMPTY, Subscription } from "rxjs";
import { filter, tap, concatMap, mergeMap, takeUntil, timeout, finalize } from "rxjs/operators";
import { Event } from "@angular/router";

export enum Direction {
  up,
  left,
  down,
  right
}

export interface Cordinates {
  x: number,
  y: number,
}

export const DistanceConfig: any = {
  up: {
    x: 0,
    y: 10
  },
  left: {
    x: -10,
    y: 0
  },
  down: {
    x: 0,
    y: -10
  },
  right: {
    x: 10,
    y: 0
  }
};
@Component({

  selector: 'app-sketchpad',
  standalone: true,
  imports: [],
  templateUrl: './sketchpad.component.html',
  styleUrl: './sketchpad.component.scss'
})
export class SketchpadComponent implements OnInit, AfterViewInit {
  name = "Angular";
  cx: any;
  canvas = { width: 1500, height: 750 };
  currentLocation = { x: 200, y: 200 };
  preDirection: string = '';
  isDrawing = false;
  startX: number;
  startY: number;
  prevStartX = 0;
  prevStartY = 0;
  prevWidth = 0;
  prevHeight = 0;
  locationList: Cordinates[] = [];
  subscriptions = new Subscription();

  @ViewChild("myCanvas", { static: false }) myCanvas: ElementRef;

  constructor(private el: ElementRef, public chatService: ChatService,) { }


  ngOnInit() {

    // this.chatService.sketchPad

    // .pipe(
    //   //   timeout({
    //   //   each: 1000,
    //   //   with: () => this.cx.beginPath(),
    //   // })
    //   finalize(() => { console.log('mouseup was triggerd') })
    // )

    // .subscribe((coordinates: any) => {
    // this.drawFromRemote(coordinates.x, coordinates.y)

    // this.cx.beginPath();


    // });
  }

  ngAfterViewInit(): void {
    var canvasEl: HTMLCanvasElement = this.myCanvas.nativeElement;
    this.cx = canvasEl.getContext("2d");
    // this.cx.fillStyle = "#FFFBE2"; //NOT WORKING NEED TO LOOK INTO CHANGEING BACKGROUND COLOR\
    this.line()

  }

  square() {

    this.cx.strokeStyle = "blue";
    this.cx.lineWidth = 3;

    const squareMouseDown$ = fromEvent(this.myCanvas.nativeElement, "mousedown");
    const suqareMouseMove$ = fromEvent(this.myCanvas.nativeElement, "mousemove");
    const squareMouseUp$ = fromEvent(this.myCanvas.nativeElement, "mouseup");

    const mouseDraw$ = squareMouseDown$.pipe(
      tap((e: any) => {
        this.cx.moveTo(e.offsetX, e.offsetY);
        this.cx.beginPath();
        this.isDrawing = true;
        this.startX = e.offsetX
        this.startY = e.offsetY

      }),
      concatMap(() => suqareMouseMove$.pipe(takeUntil(squareMouseUp$)))
    );
    mouseDraw$.subscribe((e: any) => this.drawSquare(e));
    squareMouseUp$.subscribe((e: any) => {
      this.stopDrawing()
      this.cx.strokeRect(this.prevStartX, this.prevStartY, this.prevWidth, this.prevHeight);
    })
  }

  drawSquare(e: any) {
    var canvasEl: HTMLCanvasElement = this.myCanvas.nativeElement;

    // var canvasOffset = canvasEl.offset();

    // var offsetX: number = canvasOffset.left;
    // var offsetY: number = canvasOffset.top;
    // if we're not dragging, just return
    if (!this.isDrawing) {
      return;
    }

    // get the current mouse position
    // let mouseX: number = e.clientX - offsetX;
    // let mouseY: number = e.clientY - offsetY;
    let mouseX: number = e.clientX;
    let mouseY: number = e.clientY;
    // Put your mousemove stuff here



    // calculate the rectangle width/height based
    // on starting vs current mouse position
    var width = mouseX - this.startX;
    var height = mouseY - this.startY;

    // clear the canvas
    this.cx.clearRect(0, 0, this.cx.width, this.cx.height);

    // draw a new rect from the start position 
    // to the current mouse position
    this.cx.strokeRect(this.startX, this.startY, width, height);

    this.prevStartX = this.startX;
    this.prevStartY = this.startY;

    this.prevWidth = width;
    this.prevHeight = height;
  }

  line() {
    const lineMouseDown$ = fromEvent(this.myCanvas.nativeElement, "mousedown");
    const lineMouseMove$ = fromEvent(this.myCanvas.nativeElement, "mousemove");
    const lineMouseUp$ = fromEvent(this.myCanvas.nativeElement, "mouseup");
    lineMouseDown$.pipe(concatMap(down => lineMouseMove$.pipe(takeUntil(lineMouseUp$))));

    const mouseDraw$ = lineMouseDown$.pipe(
      tap((e: any) => {
        this.cx.moveTo(e.offsetX, e.offsetY);
        this.cx.beginPath();
        this.isDrawing = true;
      }),
      concatMap(() => lineMouseMove$.pipe(takeUntil(lineMouseUp$)))
    );
    mouseDraw$.subscribe((e: any) => this.mouseDraw(e.offsetX, e.offsetY));
    lineMouseUp$.subscribe(() => {
      this.stopDrawing()
      // this.cx.beginPath()
    })
  }
  mouseDraw(offsetX: any, offsetY: any) {
    if (!this.isDrawing) return; // only draw when mouse is clicked
    this.draw(offsetX, offsetY)
    this.chatService.sendDraw(offsetX, offsetY);

    // this.chatService.sendDraw(offsetX, offsetY, this.cx.strokeStyle,  this.cx.lineWidth ); //RETURN TO SENDING COLOR DATA
  }

  logCurrentState() {
    console.log(
      'lineWidth: ', this.cx.lineWidth,
      '\n',
      'strokeStyle: ', this.cx.strokeStyle,)
  }

  public draw(offsetX: any, offsetY: any) {
    this.cx.lineTo(offsetX, offsetY);
    this.cx.lineCap = 'round';
    this.cx.stroke();
    // this.logCurrentState()
  }

  public drawFromRemote(offsetX: any, offsetY: any) {
    this.cx.arc(offsetX, offsetY, 2, 0, 2 * Math.PI, true);
    // this.cx.lineTo(offsetX, offsetY);
    this.cx.lineCap = 'round';
    this.cx.stroke();
  }

  isNewPath(newLoc: { x: number; y: number }) {
    const idx = this.locationList.findIndex(
      oldLoc => oldLoc.x === newLoc.x && oldLoc.y == newLoc.y
    );
    return idx == -1;
  }
  stopDrawing() {
    this.isDrawing = false;
  }
  getDirection() {
    const idx = Math.floor(Math.random() * 4);
    return Direction[idx];
  }

  refresh() {
    this.cx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.cx.beginPath()
  }
  extraSmall() {
    this.cx.lineWidth = 2;
  }
  small() {
    this.cx.lineWidth = 10;
  }
  medium() { this.cx.lineWidth = 20; }
  large() { this.cx.lineWidth = 40; }
  green() { this.cx.strokeStyle = 'green'; }
  blue() { this.cx.strokeStyle = 'blue'; }
  red() { this.cx.strokeStyle = 'red'; }
  black() { this.cx.strokeStyle = 'black'; }
  grey() { this.cx.strokeStyle = 'grey'; }



}