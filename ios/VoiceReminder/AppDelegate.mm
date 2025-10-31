#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTAppSetupUtils.h>

#if RCT_NEW_ARCH_ENABLED
#import <React/CoreModulesPlugin.h>
#import <React/RCTCxxBridgeDelegate.h>
#import <React/RCTFabricSurfaceHostingProxyRootView.h>
#import <React/RCTSurfacePresenter.h>
#import <React/RCTSurfacePresenterBridgeAdapter.h>
#import <ReactCommon/RCTTurboModuleManager.h>

#import <react/renderer/graphics/PlatformSurface.h>
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTAppSetupPrepareApp(application, YES);

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];

#if RCT_NEW_ARCH_ENABLED
  RCTSurfacePresenterBridgeAdapter *adapter = [[RCTSurfacePresenterBridgeAdapter alloc] initWithBridge:bridge surfacePresenter:[[RCTSurfacePresenter alloc] initWithBridge:bridge]];
  RCTSurfacePresenter *surfacePresenter = adapter.surfacePresenter;
#else
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"Voice Reminder" initialProperties:nil];
#endif

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];

#if RCT_NEW_ARCH_ENABLED
  rootViewController.view = [[RCTFabricSurfaceHostingProxyRootView alloc] initWithBridge:bridge surfacePresenter:surfacePresenter moduleName:@"Voice Reminder" initialProperties:@{}];
#else
  rootViewController.view = rootView;
#endif

  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  // Request notification permissions
  if (@available(iOS 10.0, *)) {
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;
    [center requestAuthorizationWithOptions:(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge) completionHandler:^(BOOL granted, NSError * _Nullable error) {
      if (granted) {
        NSLog(@"Notification permission granted");
      } else {
        NSLog(@"Notification permission denied");
      }
    }];
  }

  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

#if RCT_NEW_ARCH_ENABLED
#pragma mark - RCTCxxBridgeDelegate

- (std::unique_ptr<facebook::react::JSExecutorFactory>)jsExecutorFactoryForBridge:(RCTBridge *)bridge
{
  return std::make_unique<facebook::react::HermesExecutorFactory>(facebook::react::jsi::makeHermesRuntime());
}
#endif

@end