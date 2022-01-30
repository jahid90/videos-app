const MESSSAGES_PER_PAGE = 10;

const trim = (list) => {
    const result = [];

    for (let i = 0; i < list.length; ) {
        result.push(list[i]);

        if (list[i] === 0) while (list[i] === 0) i++;
        else i++;
    }

    return result;
};

const condense = (pages, currentPage) => {
    return Array(pages)
        .fill(0)
        .map((_, i) => i + 1)
        .map((it) => {
            if (it <= 2 || it >= pages - 1 || Math.abs(it - currentPage) <= 2)
                return it;
            else return 0;
        });
};

const renderPaginatedMessages = (req, res, messages, viewName, title) => {
    const pageFromReq = (req.query.page && parseInt(req.query.page, 10)) || 1;
    const pages = Math.ceil(messages.length / MESSSAGES_PER_PAGE);
    const currentPage =
        pageFromReq < 1 ? 1 : pageFromReq > pages ? pages : pageFromReq;
    const startIndex = (currentPage - 1) * MESSSAGES_PER_PAGE;
    const filtered = messages.slice(
        startIndex,
        startIndex + MESSSAGES_PER_PAGE
    );

    const condensedPages = trim(condense(pages, currentPage));

    res.render(viewName, {
        title,
        messages: filtered,
        currentPage,
        perPage: MESSSAGES_PER_PAGE,
        pages: condensedPages,
    });
};

module.exports = renderPaginatedMessages;
