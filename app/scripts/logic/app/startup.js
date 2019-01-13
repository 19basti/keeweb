import Logger from '../../util/logger';
import FeatureTester from '../comp/feature-tester';
import ExportApi from '../comp/export-api';
import IdleTracker from '../comp/idle-tracker';
import KeyHandler from '../comp/key-handler';
import AuthReceiver from '../comp/auth-receiver';
import PopupNotifier from '../comp/popup-notifier';
import KdbxwebInit from '../../util/kdbxweb-init';
import showAlert from '../ui/show-alert';
import settingsLoadRemoteConfig from '../settings/load-remote-config';
import loadSettings from '../settings/load-settings';
import loadFileInfo from '../files/load-file-info';
import uiSetView from '../../store/ui/set-view';

export default function startup() {
    return (dispatch, getState) => {
        const logger = new Logger('app');

        const state = getState();

        const { env } = state;

        if ((env.isPopup && AuthReceiver.receive()) || env.isFrame) {
            return;
        }

        Promise.resolve()
            .then(loadConfigs)
            .then(initModules)
            .then(loadRemoteConfig)
            .then(ensureCanRun)
            .then(showApp)
            .then(postInit)
            .catch(e => {
                logger.error('Error starting app', e, e.stack);
            });

        function loadConfigs() {
            return Promise.all([
                dispatch(loadSettings()),
                dispatch(loadFileInfo()),
                // UpdateModel.instance.load(),
            ]);
        }

        function initModules() {
            window.kw = ExportApi;
            IdleTracker.init();
            KeyHandler.init();
            KdbxwebInit.init();
            PopupNotifier.init();
            // return PluginManager.init();
        }

        function loadRemoteConfig() {
            return dispatch(settingsLoadRemoteConfig()).catch(e => {
                dispatch(
                    showAlert({
                        preset: 'error',
                        header: 'appSettingsError',
                        body: 'appSettingsErrorBody',
                        buttons: [],
                        esc: false,
                        enter: false,
                        click: false,
                    })
                );
                throw e;
            });
        }

        function ensureCanRun() {
            return FeatureTester.test().catch(e => {
                dispatch(
                    showAlert({
                        icon: 'exclamation-circle',
                        header: 'appSettingsError',
                        body: 'appNotSupportedError',
                        error: e,
                        buttons: [],
                        esc: false,
                        enter: false,
                        click: false,
                        opaque: true,
                    })
                );
                throw 'Feature testing failed: ' + e;
            });
        }

        function showApp() {
            return Promise.resolve().then(() => {
                const skipHttpsWarning =
                    localStorage.skipHttpsWarning || state.settings.skipHttpsWarning;
                const protocolIsInsecure =
                    ['https:', 'file:', 'app:'].indexOf(location.protocol) < 0;
                const hostIsInsecure = location.hostname !== 'localhost';
                if (protocolIsInsecure && hostIsInsecure && !skipHttpsWarning) {
                    return dispatch(
                        showAlert({
                            preset: 'error',
                            header: 'appSecWarn',
                            icon: 'user-secret',
                            esc: false,
                            enter: false,
                            click: false,
                            body: ['appSecWarnBody1', 'appSecWarnBody2'],
                            buttons: [{ result: '', title: 'appSecWarnBtn', error: true }],
                        })
                    ).then(() => showView());
                } else {
                    showView();
                }
            });
        }

        function showView() {
            dispatch(uiSetView('open'));
            logStartupTime();
        }

        function logStartupTime() {
            const time = Math.round(performance.now());
            logger.info(`Started in ${time}ms ¯\\_(ツ)_/¯`);
        }

        function postInit() {
            // Updater.init();
            // SingleInstanceChecker.init();
            // AppRightsChecker.init();
            // setTimeout(() => PluginManager.runAutoUpdate(), Timeouts.AutoUpdatePluginsAfterStart);
        }
    };
}