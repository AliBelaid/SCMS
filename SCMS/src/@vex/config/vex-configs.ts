import { mergeDeep } from '../utils/merge-deep';
import {
  VexColorScheme,
  VexConfig,
  VexConfigName,
  VexConfigs,
  VexTheme
} from './vex-config.interface';
import deepClone from '@vex/utils/deep-clone';

const baseConfig: VexConfig = {
  id: VexConfigName.apollo,
  name: 'Medisoft',
  bodyClass: 'vex-layout-apollo',
  style: {
    themeClassName: VexTheme.DEFAULT,
    colorScheme: VexColorScheme.LIGHT,
    borderRadius: {
      value: 0.5,
      unit: 'rem'
    },
    button: {
      borderRadius: {
        value: 9999,
        unit: 'px'
      }
    }
  },
  direction: 'rtl',
  imgSrc: '', // Removed external image to avoid SSL errors
  layout: 'horizontal',
  boxed: false,
  sidenav: {
    title: 'Medisoft',
    imageUrl: 'assets/img/logo/logo.svg',
    showCollapsePin: true,
    user: {
      visible: true
    },
    search: {
      visible: false
    },
    state: 'expanded'
  },
  toolbar: {
    fixed: false,
    user: {
      visible: true
    }
  },
  navbar: {
    position: 'below-toolbar'
  },
  footer: {
    visible: false,
    fixed: true
  }
};

export const vexConfigs: VexConfigs = {
  apollo: baseConfig,
  poseidon: mergeDeep(deepClone(baseConfig), {
    id: VexConfigName.poseidon,
    name: 'Poseidon',
    bodyClass: 'vex-layout-poseidon',
    imgSrc: '', // Removed external image
    sidenav: {
      user: {
        visible: true
      },
      search: {
        visible: true
      }
    },
    toolbar: {
      user: {
        visible: false
      }
    }
  }),
  hermes: mergeDeep(deepClone(baseConfig), {
    id: VexConfigName.hermes,
    name: 'Hermes',
    bodyClass: 'vex-layout-hermes',
    imgSrc: '', // Removed external image
    layout: 'vertical',
    boxed: true,
    sidenav: {
      user: {
        visible: false
      },
      search: {
        visible: false
      }
    },
    toolbar: {
      fixed: false
    },
    footer: {
      fixed: false
    }
  }),
  ares: mergeDeep(deepClone(baseConfig), {
    id: VexConfigName.ares,
    name: 'Ares',
    bodyClass: 'vex-layout-ares',
    imgSrc: '', // Removed external image
    sidenav: {
      user: {
        visible: false
      },
      search: {
        visible: false
      }
    },
    toolbar: {
      fixed: false
    },
    navbar: {
      position: 'in-toolbar'
    },
    footer: {
      fixed: false
    }
  }),
  zeus: mergeDeep(deepClone(baseConfig), {
    id: VexConfigName.zeus,
    name: 'Zeus',
    bodyClass: 'vex-layout-zeus',
    imgSrc: '', // Removed external image
    sidenav: {
      state: 'collapsed'
    }
  }),
  ikaros: mergeDeep(deepClone(baseConfig), {
    id: VexConfigName.ikaros,
    name: 'Ikaros',
    bodyClass: 'vex-layout-ikaros',
    imgSrc: '', // Removed external image
    layout: 'vertical',
    boxed: true,
    sidenav: {
      user: {
        visible: false
      },
      search: {
        visible: false
      }
    },
    toolbar: {
      fixed: false
    },
    navbar: {
      position: 'in-toolbar'
    },
    footer: {
      fixed: false
    }
  })
};
