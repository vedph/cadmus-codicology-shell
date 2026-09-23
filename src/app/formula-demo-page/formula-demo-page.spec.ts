import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { DialogService } from '@myrmidon/ngx-mat-tools';

import { FormulaDemoPageComponent } from './formula-demo-page';

describe('FormulaDemoPageComponent', () => {
  async function setup() {
    const result = await render(FormulaDemoPageComponent, {
      providers: [
        { provide: DialogService, useValue: { confirm: () => of(true) } },
      ],
    });
    return { ...result, user: userEvent.setup() };
  }

  const formulaInput = () =>
    screen.getByRole('textbox', { name: /formula/i }) as HTMLInputElement;

  it('should show the demo formula in the editor and as JSON', async () => {
    await setup();

    expect(screen.getByText('Formula Demo')).toBeInTheDocument();
    expect(formulaInput().value).toMatch(/^250 × 160 = /);
    expect(screen.getByText(/"prefix": "IT"/)).toBeInTheDocument();
    expect(screen.getByText(/"tag": "custom"/)).toBeInTheDocument();
  });

  it('should update the JSON when the edited formula is saved', async () => {
    const { user } = await setup();

    await user.clear(formulaInput());
    await user.click(formulaInput());
    await user.paste('200 × 160 = 30 [130] 40 × 15 [60 (10) 60] 15');
    await user.click(
      screen.getAllByRole('button', { description: /accept changes/i }).at(-1)!,
    );

    expect(
      screen.getByText(/"formula": "200 × 160 = 30 \[130\]/),
    ).toBeInTheDocument();
  });
});
