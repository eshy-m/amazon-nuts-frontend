import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperacionesFaja } from './operaciones-faja';

describe('OperacionesFaja', () => {
  let component: OperacionesFaja;
  let fixture: ComponentFixture<OperacionesFaja>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperacionesFaja]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperacionesFaja);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
