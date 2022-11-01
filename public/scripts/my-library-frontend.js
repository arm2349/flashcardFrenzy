import util from "./util.js";
import iconGenerator from "./deck-grid.js";

function MyLibrary() {
  const myLibrary = {};


  myLibrary.setUpPage = async function () {
    const res = await (
      await fetch("/getAuthentication", { method: "POST" })
    ).json();
    console.log("res is: ", res);
    if (!res.authenticated) {
      return util.redirect("/index");
    }
    util.renderPage();
    myLibrary.renderUserDecks();
  };

  myLibrary.renderUserDecks = async function () {
    const deckPreviews = await (
      await fetch("get-user-deck-previews", { method: "GET" })
    ).json();
    console.log("the deck previews type: ", typeof deckPreviews);
    console.log("the deck previews:", deckPreviews);
    for (let i = 0; i < deckPreviews.length; i++) {
      iconGenerator.generateDeckIcon(
        deckPreviews[i].author,
        deckPreviews[i].name,
        deckPreviews[i].deck_tags,
        deckPreviews[i]._id
      );
      console.log(deckPreviews[i]);
    }
  };

  myLibrary.setModalEvents = function () {
    const duplicateConfirm = document.querySelector("#modalConfirmDuplicate");
    const deleteConfirm = document.querySelector("#modalConfirmDelete");
    const duplicateCancel = document.querySelector("#duplicateCancel");
    const deleteCancel = document.querySelector("#deleteCancel");
    duplicateConfirm.addEventListener("click", duplicateDeck);
    deleteConfirm.addEventListener("click", removeDeck);
    duplicateCancel.addEventListener("click", clearDeckId);
    deleteCancel.addEventListener("click", clearDeckId);
  };

  const clearDeckId = async function () {
    await fetch("set-current-deck", {
      method: "POST",
      body: { currentDeckId: null },
    });
  };

  const duplicateDeck = async function () {
    const deckRes = await (
      await fetch("/getCurrentDeck", { method: "POST" })
    ).json();
    const deckId = deckRes.currentDeck;
    const res = await (await fetch("/duplicate-deck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckId: deckId }),
    })).json();
    const deckToGenerate = res.duplicateDeck.deck;
    console.log(deckToGenerate);
    iconGenerator
      .generateDeckIcon(deckToGenerate.author, deckToGenerate.name, deckToGenerate.deck_tags, deckToGenerate._id);
    if (!res.ok) {
      console.error("Failed to duplicate deck");
      //TODO - get error from res object
    }
  };

  const removeDeck = async function () {
    const deckRes = await (
      await fetch("/getCurrentDeck", { method: "POST" })
    ).json();
    const deckId = deckRes.currentDeck;
    const res = await await fetch("/delete-user-from-deck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckId: deckId }),
    });
    const res2 = await await fetch("/remove-deck-from-library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckId: deckId }),
    });
    iconGenerator.removeIcon(deckId);
    if (!res.ok || !res2.ok) {
      console.error("Error deleting the deck");
    }

  };


  return myLibrary;
}

export default MyLibrary();
