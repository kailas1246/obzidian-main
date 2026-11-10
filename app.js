(() => {
  "use strict";
  const STORAGE_KEY = "obzidian_products_v1";
  const IG_USERNAME = "obzidian._renders";
  const PLACEHOLDER = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=80";

  function readProducts() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) { return []; }
  }
  function saveProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
  function money(value) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0);
  }
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
  }
  function imageOrFallback(url) { return url || PLACEHOLDER; }
  function instagramLink(productName) {
    const message = `Hi! I'm interested in purchasing the ${productName}. Is it available?`;
    return `https://ig.me/m/${IG_USERNAME}?text=${encodeURIComponent(message)}`;
  }

  // PUBLIC STORE
  if (document.body.dataset.page === "store") {
    const grid = document.getElementById("productGrid");
    const search = document.getElementById("searchInput");
    const sort = document.getElementById("sortSelect");
    const count = document.getElementById("collectionCount");
    const modal = document.getElementById("productModal");
    let activeProduct = null;

    function renderStore() {
      const query = (search.value || "").trim().toLowerCase();
      let products = readProducts().filter(p => p.status !== "hidden" && [p.name,p.brand,p.description,p.scale].join(" ").toLowerCase().includes(query));
      if (sort.value === "price-low") products.sort((a,b) => Number(a.price)-Number(b.price));
      if (sort.value === "price-high") products.sort((a,b) => Number(b.price)-Number(a.price));
      if (sort.value === "name") products.sort((a,b) => a.name.localeCompare(b.name));
      count.textContent = `${products.length} MODEL${products.length === 1 ? "" : "S"}`;
      if (!products.length) {
        grid.innerHTML = `<div class="empty-state"><p>${query ? "No models match your search." : "The collection is being updated. Check back soon."}</p></div>`;
        return;
      }
      grid.innerHTML = products.map(p => `
        <article class="product-card" data-id="${escapeHTML(p.id)}" tabindex="0" role="button" aria-label="View ${escapeHTML(p.name)}">
          <div class="product-image">
            <img src="${escapeHTML(imageOrFallback(p.image))}" alt="${escapeHTML(p.name)}" loading="lazy" onerror="this.src='${PLACEHOLDER}'">
            <span class="product-tag ${p.status === "sold" ? "sold-tag" : ""}">${p.status === "sold" ? "Sold out" : "Available"}</span>
            <span class="product-open">↗</span>
          </div>
          <div class="product-meta"><div><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML([p.brand,p.scale].filter(Boolean).join(" · ") || "OBZIDIAN COLLECTION")}</p></div><strong class="product-price">${money(p.price)}</strong></div>
        </article>`).join("");
      grid.querySelectorAll(".product-card").forEach(card => {
        const open = () => showProduct(card.dataset.id);
        card.addEventListener("click", open);
        card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      });
    }
    function showProduct(id) {
      const p = readProducts().find(item => item.id === id);
      if (!p) return;
      activeProduct = p;
      document.getElementById("modalImage").src = imageOrFallback(p.image);
      document.getElementById("modalImage").alt = p.name;
      document.getElementById("modalName").textContent = p.name;
      document.getElementById("modalPrice").textContent = money(p.price);
      document.getElementById("modalDescription").textContent = p.description || "A miniature model from the OBZIDIAN collection. Message us for more details.";
      const specs = [["Brand / series",p.brand],["Scale",p.scale],["Material",p.material],["Operation",p.operation],["Availability",p.status === "sold" ? "Sold out" : "Available"]];
      document.getElementById("modalSpecs").innerHTML = specs.filter(row => row[1]).map(row => `<div class="spec-row"><span>${escapeHTML(row[0])}</span><strong>${escapeHTML(row[1])}</strong></div>`).join("");
      const contact = document.getElementById("modalContact");
      contact.href = instagramLink(p.name);
      contact.textContent = p.status === "sold" ? "Ask about this model" : "Contact on Instagram";
      contact.insertAdjacentHTML("beforeend", " <span>↗</span>");
      modal.classList.add("open");
      modal.setAttribute("aria-hidden","false");
      document.body.style.overflow = "hidden";
    }
    function closeModal() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden","true");
      document.body.style.overflow = "";
    }
    search.addEventListener("input", renderStore);
    sort.addEventListener("change", renderStore);
    document.getElementById("modalClose").addEventListener("click", closeModal);
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
    renderStore();
  }

  // MANAGER
  if (document.body.dataset.page === "manager") {
    const $ = id => document.getElementById(id);
    const form = $("productForm");
    const fields = ["productName","productPrice","productScale","productImage","productDescription","productMaterial","productOperation","productBrand","productStatus"];
    const getField = id => $(id).value.trim();
    function resetForm() {
      form.reset(); $("productId").value = ""; $("formHeading").textContent = "Add a product";
      $("saveButton").innerHTML = 'Add product <span>＋</span>'; $("cancelEdit").classList.add("hidden");
      $("imagePreview").src = ""; $("imagePreview").classList.remove("visible"); $("previewPlaceholder").style.display = "block";
      $("formMessage").textContent = "";
    }
    function updatePreview() {
      const url = getField("productImage");
      const img = $("imagePreview");
      if (!url) { img.classList.remove("visible"); $("previewPlaceholder").style.display = "block"; return; }
      img.onload = () => { img.classList.add("visible"); $("previewPlaceholder").style.display = "none"; };
      img.onerror = () => { img.classList.remove("visible"); $("previewPlaceholder").style.display = "block"; };
      img.src = url;
    }
    function updateStats(products) {
      $("totalProducts").textContent = products.length;
      $("availableProducts").textContent = products.filter(p => p.status === "available").length;
      $("soldProducts").textContent = products.filter(p => p.status === "sold").length;
      $("inventoryCount").textContent = `(${products.length})`;
    }
    function renderInventory() {
      const products = readProducts();
      updateStats(products);
      const query = $("managerSearch").value.trim().toLowerCase();
      const filtered = products.filter(p => [p.name,p.brand,p.scale].join(" ").toLowerCase().includes(query));
      if (!filtered.length) {
        $("inventoryList").innerHTML = `<div class="empty-inventory">${products.length ? "No products match your search." : "No products yet. Add your first model using the form."}</div>`;
        return;
      }
      $("inventoryList").innerHTML = filtered.map(p => `
        <div class="inventory-item">
          <img src="${escapeHTML(imageOrFallback(p.image))}" alt="" onerror="this.src='${PLACEHOLDER}'">
          <div><h3>${escapeHTML(p.name)}</h3><p><span class="status-dot ${p.status === "sold" ? "sold" : ""}"></span>${p.status === "sold" ? "Sold out" : "Available"}${p.scale ? " · "+escapeHTML(p.scale) : ""}</p><div class="item-price">${money(p.price)}</div></div>
          <div class="item-actions"><button class="quiet-button" data-action="edit" data-id="${escapeHTML(p.id)}">Edit</button><button class="quiet-button" data-action="delete" data-id="${escapeHTML(p.id)}">Delete</button></div>
        </div>`).join("");
      $("inventoryList").querySelectorAll("button").forEach(button => {
        button.addEventListener("click", () => {
          const id = button.dataset.id, action = button.dataset.action;
          if (action === "edit") editProduct(id);
          if (action === "delete") deleteProduct(id);
        });
      });
    }
    function editProduct(id) {
      const p = readProducts().find(item => item.id === id);
      if (!p) return;
      $("productId").value = p.id;
      const values = {productName:p.name,productPrice:p.price,productScale:p.scale,productImage:p.image,productDescription:p.description,productMaterial:p.material,productOperation:p.operation,productBrand:p.brand,productStatus:p.status};
      Object.entries(values).forEach(([key,value]) => $(key).value = value || "");
      $("formHeading").textContent = "Edit product";
      $("saveButton").innerHTML = 'Save changes <span>↗</span>';
      $("cancelEdit").classList.remove("hidden");
      updatePreview();
      window.scrollTo({top:0,behavior:"smooth"});
    }
    function deleteProduct(id) {
      const p = readProducts().find(item => item.id === id);
      if (!p || !confirm(`Delete "${p.name}" from your store?`)) return;
      saveProducts(readProducts().filter(item => item.id !== id));
      renderInventory();
      if ($("productId").value === id) resetForm();
    }
    form.addEventListener("submit", event => {
      event.preventDefault();
      const name = getField("productName"), price = Number(getField("productPrice")), image = getField("productImage");
      if (!name || !image || !Number.isFinite(price) || price < 0) {
        $("formMessage").textContent = "Please enter a product name, valid price and image URL.";
        return;
      }
      const products = readProducts();
      const id = $("productId").value || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
      const product = {id,name,price,scale:getField("productScale"),image,description:getField("productDescription"),material:getField("productMaterial"),operation:getField("productOperation"),brand:getField("productBrand"),status:getField("productStatus") || "available",updatedAt:new Date().toISOString()};
      const existingIndex = products.findIndex(p => p.id === id);
      if (existingIndex >= 0) products[existingIndex] = product; else products.unshift(product);
      saveProducts(products);
      $("formMessage").textContent = existingIndex >= 0 ? "Product updated successfully." : "Product added to your store.";
      resetForm();
      $("formMessage").textContent = existingIndex >= 0 ? "Product updated successfully." : "Product added to your store.";
      renderInventory();
    });
    $("cancelEdit").addEventListener("click", resetForm);
    $("productImage").addEventListener("input", updatePreview);
    $("managerSearch").addEventListener("input", renderInventory);
    $("exportButton").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(readProducts(),null,2)],{type:"application/json"});
      const url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = "obzidian-products-backup.json"; a.click(); URL.revokeObjectURL(url);
    });
    $("importInput").addEventListener("change", async event => {
      const file = event.target.files[0]; if (!file) return;
      try {
        const imported = JSON.parse(await file.text());
        if (!Array.isArray(imported) || imported.some(p => !p.name || !p.id)) throw new Error("Invalid backup");
        if (confirm(`Import ${imported.length} products? This will replace the current catalogue.`)) {
          saveProducts(imported); resetForm(); renderInventory();
          $("formMessage").textContent = "Backup imported successfully.";
        }
      } catch (error) { alert("Could not import this file. Please select a valid OBZIDIAN JSON backup."); }
      event.target.value = "";
    });
    renderInventory();
  }
})();