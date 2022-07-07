function InfiniteList(opts) {
  this.idx = 0;
  this.opts = opts;
  this.c = opts.container;
  this.c.addEventListener('scroll', _ => this.shouldLoadData() && this.loadData());
}

InfiniteList.prototype = {
  loadData() {
    this.loadingElem = this.opts.loadingCallback();
    this.c.append(this.loadingElem);
    globalThis.wretch(this.opts.fetch.url(++this.pageNum)).get()
      .res(this.opts.fetch.success)
      .then(data => {
        if (this.loadingElem) {
          this.loadingElem.remove()
          this.loadingElem = null;
        }
        if (!data || !data.length) {
          this.moreData = false;
          return this.pageNum === 1 && this.c.append(this.opts.emptyCallabck());
        }
        data.forEach(item => {
          item._index = this.idx++;
          this.c.append(this.opts.itemCallback(item));
        });
      }).catch(err => this.c.append('Error loading data...'))
  },
  reload() {
    this.moreData = true;
    this.pageNum = this.idx = 0;
    this.c.innerHTML = '';
    this.loadData();
  },
  shouldLoadData() {
    return this.moreData && !this.loadingElem
      && (this.c.scrollTop + this.c.clientHeight) >= this.c.scrollHeight;
  }
}

export default (opts) => {
  let ilist = new InfiniteList(opts);
  return ilist.reload() || ilist;
}
