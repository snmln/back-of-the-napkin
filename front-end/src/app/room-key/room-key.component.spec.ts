import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomKeyComponent } from './room-key.component';

describe('RoomKeyComponent', () => {
  let component: RoomKeyComponent;
  let fixture: ComponentFixture<RoomKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomKeyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoomKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
