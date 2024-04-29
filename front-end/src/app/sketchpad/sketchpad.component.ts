

import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  AfterViewInit
} from "@angular/core";
import { ChatService } from "../services/chat.service";
import { fromEvent, combineLatest, EMPTY } from "rxjs";
import { filter, tap, concatMap, mergeMap, takeUntil, timeout, finalize } from "rxjs/operators";

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

  locationList: Cordinates[] = [];

  @ViewChild("myCanvas", { static: false }) myCanvas: ElementRef;

  constructor(private el: ElementRef, public chatService: ChatService,) { }

  ngOnInit() {

    this.chatService.sketchPad
      // .pipe(
      //   //   timeout({
      //   //   each: 1000,
      //   //   with: () => this.cx.beginPath(),
      //   // })
      //   finalize(() => { console.log('mouseup was triggerd') })
      // )
      .subscribe((coordinates: any) => {
        this.drawFromRemote(coordinates.x, coordinates.y)

        // this.cx.beginPath();


      });
  }

  ngAfterViewInit(): void {
    const canvasEl: HTMLCanvasElement = this.myCanvas.nativeElement;
    this.cx = canvasEl.getContext("2d");
    // this.cx.fillStyle = "#FFFBE2"; //NOT WORKING NEED TO LOOK INTO CHANGEING BACKGROUND COLOR\

    const mouseDown$ = fromEvent(this.myCanvas.nativeElement, "mousedown");
    const mouseMove$ = fromEvent(this.myCanvas.nativeElement, "mousemove");
    const mouseUp$ = fromEvent(this.myCanvas.nativeElement, "mouseup");

    mouseDown$.pipe(concatMap(down => mouseMove$.pipe(takeUntil(mouseUp$))));

    const mouseDraw$ = mouseDown$.pipe(
      tap((e: any) => {
        this.cx.moveTo(e.offsetX, e.offsetY);
        this.cx.beginPath();
        this.isDrawing = true;
      }),
      concatMap(() => mouseMove$.pipe(takeUntil(mouseUp$)))
    );
    mouseDraw$.subscribe((e: any) => this.mouseDraw(e.offsetX, e.offsetY));
    mouseUp$.subscribe(() => {
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