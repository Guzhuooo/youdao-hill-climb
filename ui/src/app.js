import { BasePage } from './base-page.js';
import { DESIGN_WIDTH, MIN_LOGICAL_HEIGHT } from './screen-profile.js';

class App extends $falcon.App {
  onLaunch(options) {
    super.onLaunch(options);

    // Falcon scales this design width to the device's landscape width. The
    // page then fills the resulting viewport height, so wider/taller models
    // keep the same horizontal coordinate system without stretching physics.
    this.setViewPort(DESIGN_WIDTH);
    this.screenInfo = {
      designWidth: DESIGN_WIDTH,
      minimumLogicalHeight: MIN_LOGICAL_HEIGHT,
      layout: 'width-normalized-flex-height'
    };

    $falcon.useDefaultBasePageClass(BasePage);
    console.log('[screen-profile] adaptive width=' + DESIGN_WIDTH + ' minHeight=' + MIN_LOGICAL_HEIGHT);
  }

  onShow() { super.onShow(); }
  onHide() { super.onHide(); }
  onDestroy() { super.onDestroy(); }
}

export default App;
