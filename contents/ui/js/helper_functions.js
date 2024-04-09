/*
*    SPDX-FileCopyrightText: %{CURRENT_YEAR} %{AUTHOR} <%{EMAIL}>
*    SPDX-License-Identifier: LGPL-2.1-or-later
*/

import QtQuick 2.3
import QtQuick.Layouts 1.0
import QtQuick.Controls 2.0
import org.kde.plasma.core 2.0 as PlasmaCore
import org.kde.plasma.components 3.0 as PlasmaComponents
import org.kde.plasma.plasmoid 2.0
import org.kde.plasma.extras 2.0 as PlasmaExtras
import org.kde.kirigami 2.19 as Kirigami

import QtWebEngine 1.9

Item {
    id: root
    property bool themeMismatch: false;
    property int nextReloadTime: 0;
    property int reloadRetries: 0;
    property int maxReloadRetiries: 25;
    property bool loadedsuccessfully:false;

    Plasmoid.compactRepresentation: CompactRepresentation {}

    Plasmoid.fullRepresentation: ColumnLayout {
        anchors.fill: parent

        Layout.minimumWidth: 256 * PlasmaCore.Units.devicePixelRatio
        Layout.minimumHeight:  512 * PlasmaCore.Units.devicePixelRatio
        Layout.preferredWidth: 520 * PlasmaCore.Units.devicePixelRatio
        Layout.preferredHeight: 840 * PlasmaCore.Units.devicePixelRatio

        //------------------------------------- UI -----------------------------------------

        ColumnLayout {
            spacing: Kirigami.Units.mediumSpacing

            PlasmaExtras.PlasmoidHeading {
                Layout.fillWidth: true

                ColumnLayout {                    
                    anchors.fill: parent
                    Layout.fillWidth: true

                    RowLayout {
                        Layout.fillWidth: true

                        RowLayout {
                            Layout.fillWidth: true
                            spacing: Kirigami.Units.mediumSpacing

                            PlasmaComponents.ToolButton {
                                text: "Home(Github Repo)"
                                onClicked: {
                                    // Open Github.com in the default system browser
                                    Qt.openUrlExternally("https://github.com/MrGovindDubey/HackerGPT-Plasmoid")
                                }
                            }


                            Kirigami.Heading {
                                id: mrgovinddubey
                                Layout.alignment: Qt.AlignCenter
                                Layout.fillWidth: true
                                verticalAlignment: Text.AlignVCenter
                                color: theme.textColor
                            }
                        }

                        PlasmaComponents.ToolButton {
                            text: i18n("Debug")
                            checkable: true
                            checked: hackergptWebViewInspector && hackergptWebViewInspector.enabled
                            visible: Qt.application.arguments[0] == "plasmoidviewer" || plasmoid.configuration.debugConsole
                            enabled: visible
                            icon.name: "format-text-code"
                            display: PlasmaComponents.ToolButton.IconOnly
                            PlasmaComponents.ToolTip.text: text
                            PlasmaComponents.ToolTip.delay: Kirigami.Units.toolTipDelay
                            PlasmaComponents.ToolTip.visible: hovered
                            onToggled: {
                                hackergptWebViewInspector.visible = !hackergptWebViewInspector.visible;
                                hackergptWebViewInspector.enabled = visible || hackergptWebViewInspector.visible
                            }
                        }

                        PlasmaComponents.ToolButton {
                            id: refreshButton
                            text: i18n("Reload")
                            icon.name: "view-refresh"
                            display: PlasmaComponents.ToolButton.IconOnly
                            PlasmaComponents.ToolTip.text: text
                            PlasmaComponents.ToolTip.delay: Kirigami.Units.toolTipDelay
                            PlasmaComponents.ToolTip.visible: hovered
                            onClicked: hackergptWebView.reload();
                        }

                        PlasmaComponents.ToolButton {
                            id: pinButton
                            checkable: true
                            checked: plasmoid.configuration.pin
                            icon.name: "window-pin"
                            text: i18n("Keep Open")
                            display: PlasmaComponents.ToolButton.IconOnly
                            PlasmaComponents.ToolTip.text: text
                            PlasmaComponents.ToolTip.delay: Kirigami.Units.toolTipDelay
                            PlasmaComponents.ToolTip.visible: hovered
                            onToggled: plasmoid.configuration.pin = checked
                        }
                    }

                    RowLayout {
                        id: proLinkContainer
                        Layout.fillWidth: true
                        visible: false;

                        PlasmaComponents.TextField {
                            id: proLinkField

                            enabled: proLinkContainer.visible
                            Layout.fillWidth: true

                            placeholderText: i18n("Paste the access link that was sent to your email.")
                            text: ""
                        }

                        PlasmaComponents.Button {
                            enabled: proLinkContainer.visible
                            icon.name: "go-next"
                            onClicked:  {
                                hackergptWebView.url = proLinkField.text;
                                proLinkContainer.visible= false;
                            }
                        }
                    }
                }
            }

            //-------------------- Connections  -----------------------

            Binding {
                target: plasmoid
                property: "hideOnWindowDeactivate"
                value: !plasmoid.configuration.pin
            }
        }

        WebEngineView {
            Layout.fillHeight: true
            Layout.fillWidth: true

            id: hackergptWebView
            focus: true
            url: "https://chat.hackerai.co"

            profile: WebEngineProfile {
                id: hackergptProfile
                storageName: "hackergpt"
                offTheRecord: false
                httpCacheType: WebEngineProfile.DiskHttpCache
                persistentCookiesPolicy: WebEngineProfile.ForcePersistentCookies
                userScripts: [
                    WebEngineScript {
                        injectionPoint: WebEngineScript.DocumentCreation
                        name: "helperFunctions"
                        worldId: WebEngineScript.MainWorld
                        sourceUrl: "./js/helper_functions.js"
                    }
                ]
            }

            settings.javascriptCanAccessClipboard: plasmoid.configuration.allowClipboardAccess

            function isDark(color) {
                let luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
                return (luminance < 0.5);
            }
        }
        WebEngineView {
            id: hackergptWebViewInspector
            enabled: false
            visible: false
            z:100
            height:parent.height /2

            Layout.fillWidth:true
            Layout.alignment:Qt.AlignBottom
            inspectedView:enabled ? hackergptWebView : null
        }
    }
}
