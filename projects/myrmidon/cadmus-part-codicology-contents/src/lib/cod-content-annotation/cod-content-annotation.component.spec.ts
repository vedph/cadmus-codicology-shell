import { render } from '@testing-library/angular';
import { CodContentAnnotationComponent } from './cod-content-annotation.component';

describe('CodContentAnnotationComponent', () => {
  it('should create', async () => {
    const { fixture } = await render(CodContentAnnotationComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
