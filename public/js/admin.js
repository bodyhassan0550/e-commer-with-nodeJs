const deleteProduct = (btn) => {
  const prodID = btn.parentNode.querySelector("[name=id]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;

  const productElement = btn.closest("article");

  fetch("/admin/products/" + prodID, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf,
      "Content-Type": "application/json",
    },
  })
    .then((result) => {
      if (!result.ok) {
        throw new Error("Failed to delete product.");
      }
      return result.json();
    })
    .then((data) => {
      console.log(data);
      productElement.parentNode.removeChild(productElement);
    })
    .catch((err) => {
      console.error(err);
    });
};
