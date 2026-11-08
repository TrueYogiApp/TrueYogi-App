

// Register Service Worker with user opt-in
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const offlineRequested = urlParams.get('offline') === 'true';
    const alreadyInstalled = localStorage.getItem('trueyogi_offline_installed') === 'true';
    const installStarted = localStorage.getItem('trueyogi_install_started') === 'true';
    
    if (offlineRequested || alreadyInstalled || installStarted) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
         // console.log('Service Worker registered: ', registration);
          localStorage.setItem('trueyogi_offline_installed', 'true');
          localStorage.removeItem('trueyogi_install_started');
          
          // FIX: Listen for when SW is fully activated
if (registration.installing) {
  registration.installing.addEventListener('statechange', (event) => {
    const sw = event.target; // The ServiceWorker object
    if (sw && sw.state === 'activated') {
      console.log('SW fully activated and content downloaded');
      showDownloadSuccessNotification();
    }
  });
}
          
          // Also check if already active
          if (registration.active) {
            setTimeout(() => {
              showDownloadSuccessNotification();
            }, 2000);
          }
          
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('Service Worker update found!');
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New content is available; please refresh.');
                showUpdateNotification();
              }
            });
          });
        })
        .catch((registrationError) => {
          console.log('Service Worker registration failed: ', registrationError);
        });
      
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
      });
      
    } else {
      console.log('Service Worker not registered - waiting for user opt-in via FAQ');
    }
  });
}

// FAQ opt-in logic with modal - UPDATED VERSION
document.addEventListener('DOMContentLoaded', function () {
  var faqBtn = document.getElementById('faq-enable-offline-btn');
  var offlineModalBackdrop = document.getElementById('offline-modal-backdrop');
  var offlineModalAccept = document.getElementById('offline-modal-accept');
  var offlineModalCancel = document.getElementById('offline-modal-cancel');

  function showOfflineModal() {
    if (offlineModalBackdrop) offlineModalBackdrop.classList.remove('hidden');
  }
  function closeOfflineModal() {
    if (offlineModalBackdrop) offlineModalBackdrop.classList.add('hidden');
  }
  
  if (faqBtn) {
    faqBtn.addEventListener('click', showOfflineModal);
  }
  
  if (offlineModalCancel) {
    offlineModalCancel.addEventListener('click', closeOfflineModal);
  }
  
  if (offlineModalAccept) {
    offlineModalAccept.addEventListener('click', function () {
      closeOfflineModal();
	  startFastStorageMonitoring();

      // Show loading modal with progress bar
      const loadingMsg = document.createElement('div');
      loadingMsg.innerHTML = `
  <div style="
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.92);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    z-index: 10001; color: white; text-align: center; padding: 20px;
  ">
    <h2 id="launching-modal-heading" style="color: #4CAF50; margin-bottom: 20px; font-size: 1.8em;">🚀 Launching Spaceship Mode</h2>
    <p id="launching-modal-description" style="font-size: 1.1em;">Downloading meditation content...</p>
    <p id="launching-modal-note" style="font-size: 14px; opacity: 0.8; margin-top: 10px;">This will take a few minutes</p>
    
    <!-- Progress container -->
    <div style="width: 300px; margin: 30px 0 20px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span id="progress-text">Starting...</span>
        <span id="progress-percent">0%</span>
      </div>
      <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden;">
        <div id="install-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #4CAF50, #8BC34A); transition: width 0.3s ease;"></div>
      </div>
    </div>
    
    <!-- Status message -->
    <div id="status-message" style="font-size: 14px; opacity: 0.7; margin-top: 15px;"></div>
    
    <!-- Don't close warning -->
    <div id="launching-modal-warning" style="font-size: 12px; opacity: 0.6; margin-top: 25px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px;">
      ⚠️ Please keep this tab open until download completes
    </div>
  </div>
`;
      document.body.appendChild(loadingMsg);

// After: document.body.appendChild(loadingMsg);

const launchingHeading = document.getElementById('launching-modal-heading');
if (launchingHeading) launchingHeading.textContent = t('launching_modal_heading');

const launchingDesc = document.getElementById('launching-modal-description');
if (launchingDesc) launchingDesc.textContent = t('launching_modal_description');

const launchingNote = document.getElementById('launching-modal-note');
if (launchingNote) launchingNote.textContent = t('launching_modal_note');

const launchingWarning = document.getElementById('launching-modal-warning');
if (launchingWarning) launchingWarning.textContent = t('launching_modal_warning');

const progressText = document.getElementById('progress-text');
if (progressText) progressText.textContent = t('launching_modal_progress_start');

      // Start progress simulation
      let progress = 0;
const progressInterval = setInterval(() => {
  progress += 0.3; // Slower progress simulation
  const bar = document.getElementById('install-progress-bar');
  const percent = document.getElementById('progress-percent');
  const text = document.getElementById('progress-text');
  
  if (bar && percent) {
    bar.style.width = progress + '%';
    percent.textContent = Math.round(progress) + '%';
    
    // Update status text based on progress
    if (text) {
      if (progress < 30) text.textContent = t('launching_modal_progress_preparing');
      else if (progress < 60) text.textContent = t('launching_modal_progress_downloading');
      else if (progress < 90) text.textContent = t('launching_modal_progress_caching');
      else text.textContent = t('launching_modal_progress_finishing');
    }
    
    if (progress >= 95) { 
      clearInterval(progressInterval);
      // Update status to show we're waiting for SW
      const statusMsg = document.getElementById('status-message');
      if (statusMsg) {
        statusMsg.textContent = t('launching_modal_progress_wait_sw');
        statusMsg.style.opacity = '1';
      }
    }
  }
}, 100);// Update every 100ms

      // FIX: Don't redirect immediately - let SW install in background
      localStorage.setItem('trueyogi_install_started', 'true');
      
      // Register SW WITHOUT page reload
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registration started');
          
          // Listen for installation completion
          if (registration.installing) {
            const sw = registration.installing;
            
            sw.addEventListener('statechange', () => {
              console.log('SW state:', sw.state);
              
              if (sw.state === 'installed') {
                // Installation complete
                clearInterval(progressInterval);
                
                const bar = document.getElementById('install-progress-bar');
                const percent = document.getElementById('progress-percent');
                const text = document.getElementById('progress-text');
                const statusMsg = document.getElementById('status-message');
                
                if (bar) bar.style.width = '100%';
                if (percent) percent.textContent = '100%';
                if (text) text.textContent = 'Complete!';
                if (statusMsg) {
                  statusMsg.textContent = t('spaceship_ready_status');
                  statusMsg.style.color = '#4CAF50';
                  statusMsg.style.opacity = '1';
                }
                
                // Mark as installed
                localStorage.setItem('trueyogi_offline_installed', 'true');
                localStorage.removeItem('trueyogi_install_started');
                
				stopFastStorageMonitoring();
                // Update FAQ button immediately
                updateFaqButton();
				onOfflineModeInstalled();
                
                // Show success notification after 1 second
                setTimeout(() => {
                  if (loadingMsg.parentNode) {
                    loadingMsg.remove();
                  }
                  showDownloadSuccessNotification();
                }, 1500);
              }
            });
          }
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
          clearInterval(progressInterval);
          
          const statusMsg = document.getElementById('status-message');
          if (statusMsg) {
            statusMsg.textContent = '❌ Installation failed. Please try again.';
            statusMsg.style.color = '#f44336';
          }
          
          setTimeout(() => {
            if (loadingMsg.parentNode) {
              loadingMsg.remove();
            }
          }, 3000);
        });
      
      // Fallback: If something goes wrong, still allow manual refresh
      setTimeout(() => {
        // If still loading after 30 seconds, offer refresh option
        if (document.getElementById('install-progress-bar')) {
          const statusMsg = document.getElementById('status-message');
          if (statusMsg) {
            statusMsg.innerHTML = t('launching_modal_progress_long_wait');
            statusMsg.style.opacity = '1';
          }
        }
      }, 30000);
    });
  }
  
  // Update FAQ button on page load
  updateFaqButton();
});

// Function to update FAQ button
function updateFaqButton() {
  const isOfflineInstalled = localStorage.getItem('trueyogi_offline_installed') === 'true';
  const faqBtn = document.getElementById('faq-enable-offline-btn');
  const clearBtn = document.getElementById('faq-clear-offline-btn');

  if (faqBtn) {
    if (isOfflineInstalled) {
      // OFFLINE MODE IS INSTALLED
      faqBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i> <span id="enable-offline-faq-button"></span>';
      faqBtn.style.background = '#2E7D32';
      faqBtn.style.cursor = 'default';
      faqBtn.disabled = true;
      faqBtn.onclick = null;
      // Set translation for ENABLED state
      const btnLabel = document.getElementById('enable-offline-faq-button');
      if (btnLabel) btnLabel.textContent = t('enabled_offline_faq_button');

      // Clear button: enabled, shows "Clear Offline Data"
      if (clearBtn) {
        clearBtn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i> <span id="clear-offline-faq-button"></span>';
        clearBtn.style.background = '#B45309';
        clearBtn.style.cursor = 'pointer';
        clearBtn.disabled = false;
        clearBtn.onclick = function() {
          document.getElementById('clear-modal-backdrop').classList.remove('hidden');
        };
        const clearBtnLabel = document.getElementById('clear-offline-faq-button');
        if (clearBtnLabel) clearBtnLabel.textContent = t('clear_offline_faq_button');
      }
    } else {
      // OFFLINE MODE IS NOT INSTALLED
      faqBtn.innerHTML = '<i class="fas fa-download mr-2"></i> <span id="enable-offline-faq-button"></span>';
      faqBtn.style.background = '#10B981';
      faqBtn.style.cursor = 'pointer';
      faqBtn.disabled = false;
      faqBtn.onclick = function() {
        document.getElementById('offline-modal-backdrop').classList.remove('hidden');
      };
      // Set translation for NOT ENABLED state
      const btnLabel = document.getElementById('enable-offline-faq-button');
      if (btnLabel) btnLabel.textContent = t('enable_offline_faq_button');

      // Clear button: disabled, gray, shows "Clear Offline Data"
      if (clearBtn) {
        clearBtn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i> <span id="clear-offline-faq-button"></span>';
        clearBtn.style.background = '#6B7280';
        clearBtn.style.cursor = 'default';
        clearBtn.disabled = true;
        clearBtn.onclick = null;
        const clearBtnLabel = document.getElementById('clear-offline-faq-button');
        if (clearBtnLabel) clearBtnLabel.textContent = t('clear_offline_faq_button');
      }
    }
  }

  // Optionally, close modal if open
  const modalBackdrop = document.getElementById('offline-modal-backdrop');
  if (modalBackdrop && !modalBackdrop.classList.contains('hidden')) {
    modalBackdrop.classList.add('hidden');
  }
}

// Function to show download success notification
function showDownloadSuccessNotification() {
  // Check if already shown recently
  if (localStorage.getItem('trueyogi_success_shown')) return;
  
  // Create notification
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: linear-gradient(135deg, #4CAF50, #2E7D32);
      color: white;
      padding: 20px 25px;
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
      z-index: 10002;
      max-width: 380px;
      animation: slideInRight 0.5s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      border-left: 5px solid #8BC34A;
    ">
<div style="display: flex; align-items: center;">
  <div style="font-size: 32px; margin-right: 18px;">✅</div>
  <div>
    <div id="spaceship-ready-heading" style="font-weight: 600; font-size: 18px; margin-bottom: 6px;">
      Spaceship Mode Ready!
    </div>
    <div style="font-size: 15px; opacity: 0.95; line-height: 1.4;">
      <span id="spaceship-ready-description">
        All meditation content is now available offline.
      </span>
      <br>
      <span id="spaceship-ready-note" style="font-size: 13px; opacity: 0.8;">
        You can practice anytime without internet. Your spaceship is ready for liftoff!
      </span>
    </div>
  </div>
</div>
      <div style="text-align: right; margin-top: 15px;">
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 6px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Got it</button>
      </div>
    </div>
  `;
  
  // Add animation style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);

const spaceshipReadyHeading = document.getElementById('spaceship-ready-heading');
if (spaceshipReadyHeading) spaceshipReadyHeading.textContent = t('spaceship_ready_heading');

const spaceshipReadyDescription = document.getElementById('spaceship-ready-description');
if (spaceshipReadyDescription) spaceshipReadyDescription.textContent = t('spaceship_ready_description');

const spaceshipReadyNote = document.getElementById('spaceship-ready-note');
if (spaceshipReadyNote) spaceshipReadyNote.textContent = t('spaceship_ready_note');
  
  // Set flag to prevent duplicates
  localStorage.setItem('trueyogi_success_shown', 'true');
  
  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
    if (style.parentNode) {
      style.remove();
    }
  }, 12000);
  	    // Reload the page after a brief delay to ensure Chrome fully releases cache space
    setTimeout(() => {
      window.location.reload(true);
    }, 6000);
}

// Function to show update notification
function showUpdateNotification() {
  console.log('New version available - notify user');
}

// Add this to your existing script - Clear offline data functionality
document.addEventListener('DOMContentLoaded', function() {
  // Clear offline data button
  var clearBtn = document.getElementById('faq-clear-offline-btn');
  var clearModalBackdrop = document.getElementById('clear-modal-backdrop');
  var clearModalConfirm = document.getElementById('clear-modal-confirm');
  var clearModalCancel = document.getElementById('clear-modal-cancel');
  
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (clearModalBackdrop) clearModalBackdrop.classList.remove('hidden');
    });
  }
  
  if (clearModalCancel) {
    clearModalCancel.addEventListener('click', function() {
      if (clearModalBackdrop) clearModalBackdrop.classList.add('hidden');
    });
  }
  
  if (clearModalConfirm) {
    clearModalConfirm.addEventListener('click', function() {
      if (clearModalBackdrop) clearModalBackdrop.classList.add('hidden');
      
      // Show clearing message
      const clearingMsg = document.createElement('div');
clearingMsg.innerHTML = `
  <div style="
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.92);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    z-index: 10001; color: white; text-align: center; padding: 20px;
  ">
    <h2 id="clearing-modal-heading" style="color: #FF9800; margin-bottom: 20px;">🗑️ Clearing Offline Data</h2>
    <div style="font-size: 48px; margin: 30px 0;">⏳</div>
    <p id="clearing-modal-status">Removing downloaded content...</p>
    <p id="clearing-modal-note" style="font-size: 14px; opacity: 0.8; margin-top: 10px;">This may take a moment</p>
  </div>
`;
      document.body.appendChild(clearingMsg);
const heading = document.getElementById('clearing-modal-heading');
if (heading) heading.textContent = t('clearing_modal_heading');

const status = document.getElementById('clearing-modal-status');
if (status) status.textContent = t('clearing_modal_status');

const note = document.getElementById('clearing-modal-note');
if (note) note.textContent = t('clearing_modal_note');
      
      // Clear all service workers and caches
      clearOfflineData().then(() => {
        // Remove clearing message
        setTimeout(() => {
          if (clearingMsg.parentNode) {
            clearingMsg.remove();
          }
          
          // Show success message
          showClearedNotification();
		  onOfflineDataCleared();
          updateFaqButton();
		  
          // Re-enable the install button
          const faqBtn = document.getElementById('faq-enable-offline-btn');
          if (faqBtn) {
            faqBtn.innerHTML = '<i class="fas fa-download mr-2"></i> <span id="enable-offline-faq-button"></span>';
            faqBtn.style.background = '';
            faqBtn.style.cursor = 'pointer';
            faqBtn.disabled = false;
            faqBtn.onclick = function() {
              document.getElementById('offline-modal-backdrop').classList.remove('hidden');
            };
			  // Set translation
  const btnLabel = document.getElementById('enable-offline-faq-button');
  if (btnLabel) btnLabel.textContent = t('enable_offline_faq_button');
          }
		  
		      // ADD THIS: Disable the clear button after clearing
    const clearBtn = document.getElementById('faq-clear-offline-btn');
    if (clearBtn) {
      clearBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i> <span id="clear-offline-faq-button"></span>';
const clearBtnLabel = document.getElementById('clear-offline-faq-button');
if (clearBtnLabel) clearBtnLabel.textContent = t('cleared_offline_faq_button');
      clearBtn.style.background = '#6B7280'; // Gray color
      clearBtn.style.cursor = 'default';
      clearBtn.disabled = true;
      clearBtn.onclick = null;
    }
	
        }, 1000);
      });
    });
  }
});

// Function to clear all offline data
async function clearOfflineData() {
  try {
    // 1. Unregister all service workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('SW unregistered');
    }
    
    // 2. Clear all caches
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('Caches cleared');
    
    // 3. Clear localStorage flags
    localStorage.removeItem('trueyogi_offline_installed');
    localStorage.removeItem('trueyogi_install_started');
    localStorage.removeItem('trueyogi_install_notified');
    localStorage.removeItem('trueyogi_success_shown');
	localStorage.removeItem('storage_used_mb');
    localStorage.removeItem('storage_last_checked');
    
    // 5. Send message to SW to clear caches (if still active)
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_APP_CACHE'
      });
    }
    
	    // 4. Reload the page after a brief delay to ensure Chrome fully releases cache space
    setTimeout(() => {
      window.location.reload(true);
    }, 6000);
	
    return true;
  } catch (error) {
    console.error('Error clearing offline data:', error);
    return false;
  }
}

// Function to show cleared notification
function showClearedNotification() {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: linear-gradient(135deg, #FF9800, #F57C00);
      color: white;
      padding: 20px 25px;
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(255, 152, 0, 0.3);
      z-index: 10002;
      max-width: 380px;
      animation: slideInRight 0.5s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      border-left: 5px solid #FFB74D;
    ">
      <div style="display: flex; align-items: center;">
        <div style="font-size: 32px; margin-right: 18px;">✅</div>
        <div>
          <div id="offline-cleared-heading">Offline Data Cleared</div>
          <div>
            <span id="offline-cleared-description">storage freed.</span>
            <br>
            <span id="offline-cleared-note">You can re-enable spaceship mode anytime.</span>
          </div>
        </div>
      </div>
      <div style="text-align: right; margin-top: 15px;">
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 6px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Got it</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);

  // Set translations
  const clearedHeading = document.getElementById('offline-cleared-heading');
  if (clearedHeading) clearedHeading.textContent = t('offline_cleared_heading');
  const clearedDescription = document.getElementById('offline-cleared-description');
  if (clearedDescription) clearedDescription.textContent = t('offline_cleared_description');
  const clearedNote = document.getElementById('offline-cleared-note');
  if (clearedNote) clearedNote.textContent = t('offline_cleared_note');
  const gotItBtn = document.getElementById('offline-cleared-close');
  if (gotItBtn) gotItBtn.textContent = t('offline_cleared_gotit');

  if (gotItBtn) {
    gotItBtn.onclick = function() {
      if (notification.parentNode) notification.remove();
    };
  }
  
  // Auto-remove after 6 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 12000);
}

// ==================== STORAGE MONITORING ====================
let storageUpdateInterval = null;
let fastStorageInterval = null;

// Update storage info
function updateStorageInfo() {
  // Check localStorage flag first - if cleared, show "Not installed" immediately
  const isOfflineInstalled = localStorage.getItem('trueyogi_offline_installed') === 'true';
  
  if (!isOfflineInstalled) {
    // Offline mode is NOT installed, show "Not installed" immediately
    updateStorageFallback();
    return; // Don't query storage API
  }
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(estimate => {
      const usedMB = Math.round(estimate.usage / 1024 / 1024);
      
      //console.log(`Storage: ${usedMB}MB used`); // Simplified log
      
      // Update all UI elements
      const storageEl = document.getElementById('storage-size');
      const lastUpdated = document.getElementById('last-updated');
      
      if (storageEl) {
        if (usedMB > 0) {
          storageEl.textContent = `${usedMB}MB`;
          storageEl.className = 'font-medium text-green-400';
        } else {
          storageEl.textContent = t('storage_not_installed1');
          storageEl.className = 'font-medium text-gray-400';
        }
      }
      
      
      if (lastUpdated) {
        const now = new Date();
        lastUpdated.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
      }
      
      // Save to localStorage for offline viewing
      localStorage.setItem('storage_last_checked', Date.now());
      localStorage.setItem('storage_used_mb', usedMB);
      
    }).catch(error => {
      console.error('Storage estimate failed:', error);
      updateStorageFallback();
    });
  } else {
    updateStorageFallback();
  }
}

// Fallback for browsers without storage.estimate()
function updateStorageFallback() {
  const storageEl = document.getElementById('storage-size');
  const lastUpdated = document.getElementById('last-updated'); // Keep this for time update
  
  // CHECK LOCALSTORAGE FLAG - if cleared, show "Not installed"
  const isOfflineInstalled = localStorage.getItem('trueyogi_offline_installed') === 'true';
  
  if (isOfflineInstalled) {
    // User has offline mode - show approximate size
    if (storageEl) {
      storageEl.textContent = '~200MB';
      storageEl.className = 'font-medium text-green-400';
    }
  } else {
    // No offline mode - FORCE "Not installed" display
    if (storageEl) {
      storageEl.textContent = t('storage_not_installed2');
      storageEl.className = 'font-medium text-gray-400';
    }
  }
  
  // Update last updated time if element exists
  if (lastUpdated) {
    const now = new Date();
    lastUpdated.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
  }
}

// Start fast storage monitoring (for installations)
function startFastStorageMonitoring() {
  // Clear any existing interval
  if (fastStorageInterval) {
    clearInterval(fastStorageInterval);
  }
  
  // Update immediately
  updateStorageInfo();
  
  // Update every 2 seconds
  fastStorageInterval = setInterval(() => {
    updateStorageInfo();
  }, 2000);
  
  console.log('Fast storage monitoring started (2s intervals)');
}

// Stop fast storage monitoring
function stopFastStorageMonitoring() {
  if (fastStorageInterval) {
    clearInterval(fastStorageInterval);
    fastStorageInterval = null;
    console.log('Fast storage monitoring stopped');
  }
}

// Start normal storage monitoring
function startNormalStorageMonitoring() {
  // Clear any existing interval
  if (storageUpdateInterval) {
    clearInterval(storageUpdateInterval);
  }
  
  // Update immediately
  updateStorageInfo();
  
  // Update every 30 minutes
  storageUpdateInterval = setInterval(() => {
    updateStorageInfo();
  }, 30 * 60 * 1000); // 30 minutes = 30 * 60 * 1000 milliseconds
  
  //console.log('Normal storage monitoring started (15s intervals)');
}

// Update storage info when offline mode is installed
function onOfflineModeInstalled() {
  console.log('Offline mode installed - updating storage display');
  
  // Stop fast monitoring, start normal
  stopFastStorageMonitoring();
  startNormalStorageMonitoring();
  
  // Force several immediate updates
  for (let i = 1; i <= 5; i++) {
    setTimeout(updateStorageInfo, i * 1000);
  }
}

// Update storage info when data is cleared
function onOfflineDataCleared() {
  console.log('Offline data cleared - updating storage display');
  
  // Force immediate updates
  setTimeout(updateStorageInfo, 300);
  setTimeout(updateStorageInfo, 800);
  setTimeout(updateStorageInfo, 1500);
  setTimeout(updateStorageInfo, 2500);
  
  // Ensure normal monitoring is running
  startNormalStorageMonitoring();
}

// Initialize storage monitoring
function initStorageMonitoring() {
  // Start normal monitoring
  startNormalStorageMonitoring();
  
  // If installation is in progress, start fast monitoring
  if (localStorage.getItem('trueyogi_install_started') === 'true') {
    startFastStorageMonitoring();
  }
  
  // Update on visibility change
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      updateStorageInfo();
    }
  });
  
  // Update when window gets focus
  window.addEventListener('focus', updateStorageInfo);
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Wait a moment for everything to initialize
  setTimeout(initStorageMonitoring, 500);
});

// ==================== END STORAGE MONITORING ====================

function showClearCacheModal() {
  document.getElementById('clearCacheModal').classList.remove('hidden');
}
function hideClearCacheModal() {
  document.getElementById('clearCacheModal').classList.add('hidden');
}

function clearAppCache() {
  hideClearCacheModal();
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_APP_CACHE' });
  }
  navigator.serviceWorker.getRegistration().then(function(reg) {
    if (reg) {
      reg.unregister().then(function(success) {
        // Set flag BEFORE reload
        localStorage.setItem('showCacheClearedTooltip', '1');
        setTimeout(function() {
          window.location.reload(true);
        }, 100);
      });
    } else {
      // Set flag BEFORE reload
      localStorage.setItem('showCacheClearedTooltip', '1');
      window.location.reload(true);
    }
  });
}

function showTooltip(message) {
  let el = document.createElement('div');
  el.textContent = message;
  el.style.position = 'fixed';
  el.style.bottom = '16px';
  el.style.left = '50%';
  el.style.transform = 'translateX(-50%)';
  el.style.background = '#232325cc';
  el.style.color = '#fffacd';
  el.style.padding = '10px 26px';
  el.style.borderRadius = '14px';
  el.style.fontWeight = '700';
  el.style.boxShadow = '0 4px 24px #000a';
  el.style.zIndex = 9999;
  el.style.fontSize = '1.09em';
  document.body.appendChild(el);
  setTimeout(() => { el.remove(); }, 6000);
}
