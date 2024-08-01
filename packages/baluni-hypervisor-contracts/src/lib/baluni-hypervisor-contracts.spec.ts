import { hello } from './baluni-hypervisor-contracts';

describe('baluniHypervisorContracts', () => {
  it('should work', () => {
    expect(hello()).toEqual('baluni-hypervisor-contracts');
  });
});
