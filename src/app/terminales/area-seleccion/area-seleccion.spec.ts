import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Kiosco } from './kiosco';

describe('Kiosco', () => {
  let component: Kiosco;
  let fixture: ComponentFixture<Kiosco>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Kiosco]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Kiosco);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
