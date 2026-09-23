import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { DynamicDialog } from './dynamic-dialog';

@Component({
  selector: 'test-dummy-content',
  template: `<p>dummy content</p>`,
})
class DummyContent {}

@Component({
  selector: 'test-dialog-host',
  template: `<button type="button" (click)="open()">open</button>`,
})
class DialogHost {
  private readonly _dialog = inject(MatDialog);
  public readonly closed = vi.fn();
  public data: any = { title: 'My Dialog', component: DummyContent };

  public open(): void {
    this._dialog
      .open(DynamicDialog, { data: this.data })
      .afterClosed()
      .subscribe((result) => this.closed(result));
  }
}

describe('DynamicDialog', () => {
  async function setup(data?: any) {
    const result = await render(DialogHost);
    const host = result.fixture.componentInstance;
    if (data) {
      host.data = data;
    }
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'open' }));
    return { ...result, host, user };
  }

  it('should show the title and the hosted component', async () => {
    await setup();

    expect(
      await screen.findByRole('heading', { name: 'My Dialog' }),
    ).toBeInTheDocument();
    expect(screen.getByText('dummy content')).toBeInTheDocument();
  });

  it('should show a default title when none is provided', async () => {
    await setup({ component: DummyContent });

    expect(
      await screen.findByRole('heading', { name: 'Dialog' }),
    ).toBeInTheDocument();
  });

  it('should close with true when clicking Close', async () => {
    const { host, user } = await setup();

    await user.click(await screen.findByRole('button', { name: 'Close' }));

    await waitFor(() => expect(host.closed).toHaveBeenCalledWith(true));
  });

  it('should close without result when clicking Cancel', async () => {
    const { host, user } = await setup();

    await user.click(await screen.findByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(host.closed).toHaveBeenCalled());
    expect(host.closed.mock.calls[0][0]).toBeFalsy();
  });
});
