/** Contains general utility methods */
class Util {

  /**
  * Paginate an array of items
  * @param {Object[]} items - An array of items to paginate
  * @param {number} [page=1] - The page to select
  * @param {number} [pageLength=10] - The number of items per page
  * @return {Object} The resulting paginated object
  * @property {Object[]} items - The chunk of items for the current page
  * @property {number} page - The current page
  * @property {number} maxPage - The maximum page
  * @property {number} pageLength - The numer of items per page
  * @property {string} pageText - The current page string ("page x of y")
  * @see {@link BotUtil#paginate}
  */
  Paginate(items, page = 1, pageLength = 10) {
    const maxPage = Math.ceil(items.length / pageLength);
    if(page < 1) page = 1;
    if(page > maxPage) page = maxPage;
    let startIndex = (page - 1) * pageLength;
    return {
      items: items.length > pageLength ? items.slice(startIndex, startIndex + pageLength) : items,
      page: page,
      maxPage: maxPage,
      pageLength: pageLength,
      pageText: `page ${page} of ${maxPage}`
    };
  }

  /**
  * Search for matches in a list of items
  * @param {Object[]} items - An array of items to search in
  * @param {string} searchString - The string to search for
  * @param {SearchOptions} options - An options object
  * @return {Object[]} The matched items
  * @see {@link BotUtil#search}
  */
  Search(items, searchString, { property = 'name', searchInexact = true, searchExact = true, useStartsWith = false } = {}) {
    if(!items || items.length === 0) return [];
    if(!searchString) return items;

    const lowercaseSearch = searchString.toLowerCase();
    let matchedItems;

    // Find all items that start with or include the search string
    if(searchInexact) {
      if (useStartsWith && searchString.length === 1) {
        matchedItems = items.filter(element => String(property ? element[property] : element)
        .normalize('NFKD')
        .toLowerCase()
        .startsWith(lowercaseSearch));
      } else {
        matchedItems = items.filter(element => String(property ? element[property] : element)
        .normalize('NFKD')
        .toLowerCase()
        .includes(lowercaseSearch));
      }
    } else {
      matchedItems = items;
    }

    // See if any are an exact match
    if(searchExact && matchedItems.length > 1) {
      const exactItems = matchedItems.filter(element => String(property ? element[property] : element).normalize('NFKD').toLowerCase() === lowercaseSearch);
      if(exactItems.length > 0) return exactItems;
    }

    return matchedItems;
  }

  /**
   * Add padding to the right of a string
   * @param {String} string - The string to pad
   * @param {Integer} length - Length of final string
   * @return {String} The string with padding on the right
   */
  Pad(string, length) {
    return string + ' '.repeat(length - string.length);
  }

  /**
	 * Escapes Markdown in the string
	 * @param {string} text - The text to escape
	 * @returns {string} The escaped text
	 */
	EscapeMarkdown(text) {
		return text.replace(/\\(\*|_|`|~|\\)/g, '$1').replace(/(\*|_|`|~|\\)/g, '\\$1');
	}

}

module.exports = new Util();
