// Campus Lost & Found - Frontend App
// Plain browser JS - no strict mode, no modules

var allItems = [];
var activeTab = 'all';
var searchQuery = '';
var statusFilter = '';
var toastTimer = null;

// ── Helpers ──────────────────────────────────────────────────────────────────

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(d) {
  if (!d) return '-';
  var date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showToast(msg, type) {
  clearTimeout(toastTimer);
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast toast--' + (type || 'success');
  t.hidden = false;
  toastTimer = setTimeout(function() { t.hidden = true; }, 3500);
}

function show(id)  { var el = document.getElementById(id); if (el) el.hidden = false; }
function hide(id)  { var el = document.getElementById(id); if (el) el.hidden = true; }

// ── Stats ─────────────────────────────────────────────────────────────────────

function updateStats(items) {
  document.getElementById('statTotal').textContent  = items.length;
  document.getElementById('statLost').textContent   = items.filter(function(i){ return i.category === 'Lost'; }).length;
  document.getElementById('statFound').textContent  = items.filter(function(i){ return i.category === 'Found'; }).length;
  document.getElementById('statActive').textContent = items.filter(function(i){ return i.status === 'Active'; }).length;
}

// ── Render Cards ──────────────────────────────────────────────────────────────

function renderItems() {
  var filtered = allItems.slice();

  if (activeTab !== 'all') {
    filtered = filtered.filter(function(i) { return i.category === activeTab; });
  }
  if (statusFilter) {
    filtered = filtered.filter(function(i) { return i.status === statusFilter; });
  }
  if (searchQuery) {
    var q = searchQuery.toLowerCase();
    filtered = filtered.filter(function(i) {
      return i.title.toLowerCase().indexOf(q) !== -1 ||
             i.description.toLowerCase().indexOf(q) !== -1 ||
             i.location.toLowerCase().indexOf(q) !== -1;
    });
  }

  updateStats(filtered);

  var grid = document.getElementById('itemsGrid');

  if (filtered.length === 0) {
    grid.innerHTML = '';
    show('emptyState');
    return;
  }

  hide('emptyState');

  var html = '';
  for (var i = 0; i < filtered.length; i++) {
    var item = filtered[i];
    html += '<div class="card card--' + esc(item.category) + '">' +
      '<div class="card__banner"></div>' +
      '<div class="card__body">' +
        '<div class="card__badges">' +
          '<span class="badge badge--' + esc(item.category) + '">' + esc(item.category) + '</span>' +
          '<span class="badge badge--' + esc(item.status) + '">' + esc(item.status) + '</span>' +
          '<span class="badge badge--category">' + esc(item.item_category) + '</span>' +
        '</div>' +
        '<h3 class="card__title">' + esc(item.title) + '</h3>' +
        '<div class="card__meta">' +
          '<span>&#128205; ' + esc(item.location) + '</span>' +
          '<span>&#128197; ' + fmtDate(item.date_reported) + '</span>' +
          '<span>&#128100; ' + esc(item.contact_name) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="card__footer">' +
        '<button class="btn btn--secondary card-btn" data-action="view" data-id="' + item.id + '">&#128065; View</button>' +
        '<button class="btn btn--primary card-btn" data-action="edit" data-id="' + item.id + '">&#9999; Edit</button>' +
        '<button class="btn btn--danger card-btn" data-action="delete" data-id="' + item.id + '" data-title="' + esc(item.title) + '">&#128465; Delete</button>' +
      '</div>' +
    '</div>';
  }

  grid.innerHTML = html;
}

// ── Fetch All Items ───────────────────────────────────────────────────────────

function fetchItems() {
  hide('emptyState');

  fetch('/api/items')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      allItems = data.data || [];
      renderItems();
    })
    .catch(function() {
      showToast('Could not load items. Make sure the server is running.', 'error');
    });
}

// ── View Item Detail ──────────────────────────────────────────────────────────

function viewItem(id) {
  fetch('/api/items/' + id)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var item = data.data;
      document.getElementById('detailTitle').textContent = item.title;

      document.getElementById('detailContent').innerHTML =
        '<div class="detail__section">' +
          '<h3>Item Information</h3>' +
          '<div class="detail__row"><span class="detail__key">Type</span><span class="detail__value"><span class="badge badge--' + esc(item.category) + '">' + esc(item.category) + '</span></span></div>' +
          '<div class="detail__row"><span class="detail__key">Category</span><span class="detail__value">' + esc(item.item_category) + '</span></div>' +
          '<div class="detail__row"><span class="detail__key">Status</span><span class="detail__value"><span class="badge badge--' + esc(item.status) + '">' + esc(item.status) + '</span></span></div>' +
          '<div class="detail__row"><span class="detail__key">Location</span><span class="detail__value">' + esc(item.location) + '</span></div>' +
          '<div class="detail__row"><span class="detail__key">Date</span><span class="detail__value">' + fmtDate(item.date_reported) + '</span></div>' +
          '<div class="detail__row"><span class="detail__key">Description</span><span class="detail__value">' + esc(item.description) + '</span></div>' +
        '</div>' +
        '<div class="detail__section">' +
          '<h3>Contact Information</h3>' +
          '<div class="detail__row"><span class="detail__key">Name</span><span class="detail__value">' + esc(item.contact_name) + '</span></div>' +
          '<div class="detail__row"><span class="detail__key">Email</span><span class="detail__value">' + esc(item.contact_email) + '</span></div>' +
          '<div class="detail__row"><span class="detail__key">Phone</span><span class="detail__value">' + (esc(item.contact_phone) || '-') + '</span></div>' +
        '</div>' +
        '<div class="detail__section">' +
          '<h3>Update Status</h3>' +
          '<div class="detail__status-update">' +
            '<select class="select" id="quickStatus">' +
              '<option value="Active"' + (item.status === 'Active' ? ' selected' : '') + '>Active</option>' +
              '<option value="Claimed"' + (item.status === 'Claimed' ? ' selected' : '') + '>Claimed</option>' +
              '<option value="Resolved"' + (item.status === 'Resolved' ? ' selected' : '') + '>Resolved</option>' +
            '</select>' +
            '<button class="btn btn--success" id="quickStatusBtn">&#10004; Update</button>' +
          '</div>' +
        '</div>' +
        '<div class="detail__actions">' +
          '<button class="btn btn--primary" id="detailEditBtn">&#9999; Edit Report</button>' +
          '<button class="btn btn--danger" id="detailDeleteBtn">&#128465; Delete Report</button>' +
        '</div>';

      // Wire buttons AFTER injecting HTML into the DOM
      document.getElementById('quickStatusBtn').onclick = function() {
        var status = document.getElementById('quickStatus').value;
        updateStatus(id, status);
      };

      document.getElementById('detailEditBtn').onclick = function() {
        closeDetailModal();
        editItem(id);
      };

      document.getElementById('detailDeleteBtn').onclick = function() {
        closeDetailModal();
        deleteItem(id, item.title);
      };

      show('detailModal');
    })
    .catch(function() {
      showToast('Could not load item details.', 'error');
    });
}

// ── Update Status ─────────────────────────────────────────────────────────────

function updateStatus(id, status) {
  fetch('/api/items/' + id + '/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: status })
  })
  .then(function(res) { return res.json(); })
  .then(function() {
    showToast('Status updated to ' + status);
    fetchItems();
  })
  .catch(function() {
    showToast('Failed to update status.', 'error');
  });
}

// ── Edit Item ─────────────────────────────────────────────────────────────────

function editItem(id) {
  fetch('/api/items/' + id)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var item = data.data;
      document.getElementById('itemId').value         = item.id;
      document.getElementById('category').value       = item.category;
      document.getElementById('item_category').value  = item.item_category;
      document.getElementById('title').value          = item.title;
      document.getElementById('description').value    = item.description;
      document.getElementById('location').value       = item.location;
      document.getElementById('date_reported').value  = item.date_reported ? item.date_reported.substring(0, 10) : '';
      document.getElementById('contact_name').value   = item.contact_name;
      document.getElementById('contact_email').value  = item.contact_email;
      document.getElementById('contact_phone').value  = item.contact_phone || '';
      document.getElementById('status').value         = item.status;
      document.getElementById('statusGroup').hidden   = false;
      document.getElementById('modalTitle').textContent = 'Edit Report';
      document.getElementById('submitBtn').textContent  = 'Save Changes';
      clearErrors();
      show('reportModal');
    })
    .catch(function() {
      showToast('Could not load item for editing.', 'error');
    });
}

// ── Delete Item ───────────────────────────────────────────────────────────────

function deleteItem(id, title) {
  if (!confirm('Delete "' + title + '"?\nThis cannot be undone.')) return;

  fetch('/api/items/' + id, { method: 'DELETE' })
    .then(function(res) { return res.json(); })
    .then(function() {
      showToast('Report deleted.');
      fetchItems();
    })
    .catch(function() {
      showToast('Failed to delete report.', 'error');
    });
}

// ── Form Validation ───────────────────────────────────────────────────────────

function setError(field, msg) {
  var el  = document.getElementById(field);
  var err = document.getElementById(field + 'Error');
  if (el)  el.classList.toggle('error', !!msg);
  if (err) err.textContent = msg || '';
}

function clearErrors() {
  var fields = ['category','item_category','title','description','location','date_reported','contact_name','contact_email','contact_phone'];
  for (var i = 0; i < fields.length; i++) setError(fields[i], '');
}

function validateForm() {
  var ok = true;

  function req(f, label) {
    var el = document.getElementById(f);
    if (!el || !el.value.trim()) { setError(f, label + ' is required.'); ok = false; return false; }
    return true;
  }

  req('category', 'Report type');
  req('item_category', 'Item category');

  if (req('title', 'Title')) {
    if (document.getElementById('title').value.trim().length < 3) {
      setError('title', 'Title must be at least 3 characters.'); ok = false;
    }
  }
  if (req('description', 'Description')) {
    if (document.getElementById('description').value.trim().length < 10) {
      setError('description', 'Description must be at least 10 characters.'); ok = false;
    }
  }
  req('location', 'Location');
  req('date_reported', 'Date');
  req('contact_name', 'Contact name');

  if (req('contact_email', 'Email')) {
    var email = document.getElementById('contact_email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('contact_email', 'Enter a valid email address.'); ok = false;
    }
  }

  return ok;
}

// ── Form Submit ───────────────────────────────────────────────────────────────

document.getElementById('reportForm').addEventListener('submit', function(e) {
  e.preventDefault();
  clearErrors();
  if (!validateForm()) return;

  var id  = document.getElementById('itemId').value;
  var btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  var body = {
    category:      document.getElementById('category').value,
    item_category: document.getElementById('item_category').value,
    title:         document.getElementById('title').value.trim(),
    description:   document.getElementById('description').value.trim(),
    location:      document.getElementById('location').value.trim(),
    date_reported: document.getElementById('date_reported').value,
    contact_name:  document.getElementById('contact_name').value.trim(),
    contact_email: document.getElementById('contact_email').value.trim(),
    contact_phone: document.getElementById('contact_phone').value.trim(),
    status:        document.getElementById('status').value || 'Active'
  };

  var url    = id ? '/api/items/' + id : '/api/items';
  var method = id ? 'PUT' : 'POST';

  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data.success) {
      showToast(id ? 'Report updated!' : 'Report submitted!');
      closeReportModal();
      fetchItems();
    } else {
      if (data.errors) {
        data.errors.forEach(function(err) { setError(err.field, err.message); });
      }
      showToast(data.message || 'Submission failed.', 'error');
    }
    btn.disabled = false;
    btn.textContent = id ? 'Save Changes' : 'Submit Report';
  })
  .catch(function() {
    showToast('Network error. Please try again.', 'error');
    btn.disabled = false;
    btn.textContent = id ? 'Save Changes' : 'Submit Report';
  });
});

// ── Modal Helpers ─────────────────────────────────────────────────────────────

function openReportModal() {
  document.getElementById('reportForm').reset();
  clearErrors();
  document.getElementById('itemId').value = '';
  document.getElementById('statusGroup').hidden = true;
  document.getElementById('modalTitle').textContent = 'Submit Report';
  document.getElementById('submitBtn').textContent = 'Submit Report';
  document.getElementById('date_reported').value = new Date().toISOString().split('T')[0];
  show('reportModal');
}

function closeReportModal() {
  hide('reportModal');
  document.getElementById('reportForm').reset();
  clearErrors();
}

function closeDetailModal() {
  hide('detailModal');
}

// ── Event Listeners ───────────────────────────────────────────────────────────

document.getElementById('reportBtn').addEventListener('click', openReportModal);

var emptyBtn = document.getElementById('emptyReportBtn');
if (emptyBtn) emptyBtn.addEventListener('click', openReportModal);

document.getElementById('closeModal').addEventListener('click', closeReportModal);
document.getElementById('cancelBtn').addEventListener('click', closeReportModal);
document.getElementById('closeDetail').addEventListener('click', closeDetailModal);

document.getElementById('reportModal').addEventListener('click', function(e) {
  if (e.target === this) closeReportModal();
});
document.getElementById('detailModal').addEventListener('click', function(e) {
  if (e.target === this) closeDetailModal();
});

document.querySelectorAll('.tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('tab--active'); });
    tab.classList.add('tab--active');
    activeTab = tab.getAttribute('data-tab');
    renderItems();
  });
});

var searchDebounce;
document.getElementById('searchInput').addEventListener('input', function() {
  clearTimeout(searchDebounce);
  var val = this.value;
  searchDebounce = setTimeout(function() {
    searchQuery = val.trim();
    renderItems();
  }, 300);
});

document.getElementById('statusFilter').addEventListener('change', function() {
  statusFilter = this.value;
  renderItems();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (!document.getElementById('reportModal').hidden) closeReportModal();
    if (!document.getElementById('detailModal').hidden) closeDetailModal();
  }
});

// ── Card Buttons - Event Delegation ──────────────────────────────────────────

document.getElementById('itemsGrid').addEventListener('click', function(e) {
  // Walk up the DOM tree to find the button with data-action
  var target = e.target;
  while (target && target !== this) {
    if (target.getAttribute('data-action')) break;
    target = target.parentElement;
  }

  if (!target || !target.getAttribute('data-action')) return;

  var action = target.getAttribute('data-action');
  var id     = parseInt(target.getAttribute('data-id'), 10);
  var title  = target.getAttribute('data-title') || '';

  if (action === 'view')   viewItem(id);
  if (action === 'edit')   editItem(id);
  if (action === 'delete') deleteItem(id, title);
});

// ── Start ─────────────────────────────────────────────────────────────────────
fetchItems();
