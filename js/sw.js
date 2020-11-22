var cache_var = "V8";
var cache_page = [
    '/html/index.html',
    '/html/account/account.html',
    '/html/account/add-export.html',
    '/html/account/export.html',
    '/html/account/token_export.html',
    '/html/block_browser/address.html',
    '/html/block_browser/block.html',
    '/html/block_browser/block_detail.html',
    '/html/block_browser/index.html',
    '/html/block_browser/transactions.html'
];

self.addEventListener('install',function (event)  {
    self.skipWaiting();
    // 如果监听到了 service worker 已经安装成功的话，就会调用 event.waitUntil 回调函数
    event.waitUntil(
        // 安装成功后操作 CacheStorage 缓存，使用之前需要先通过 caches.open() 打开对应缓存空间。
        caches.open(cache_var).then(function (cache) {
            // 通过 cache 缓存对象的 addAll 方法添加 precache 缓存
            return cache.addAll([
                "/js/mui.min.js",
                "/js/immersed.js",
                "/js/h.min.js",
                "/js/app.js",
                "/js/vue.js",
                "/js/error.js",
                "/js/vue-countup.min.js",
                '/html/index.html',
                '/html/account/account.html',
                '/html/account/add-export.html',
                '/html/account/export.html',
                '/html/account/token_export.html',
                '/html/block_browser/address.html',
                '/html/block_browser/block.html',
                '/html/block_browser/block_detail.html',
                '/html/block_browser/index.html',
                '/html/block_browser/transactions.html'
            ]);
        })
    );
});

self.addEventListener('message', function (event) {
    var cmd = event.data;
    switch(cmd.type)
    {
        case "update":
            if(cmd.version !== cache_var)
            {
                caches.keys().then(function (cacheNames) {
                    return Promise.all(cacheNames.map(function (cacheName) {
                        return caches.delete(cacheName);
                    }))
                })
            }
            break;
        case "refresh-cache":
            caches.keys().then(function (cacheNames) {
                return Promise.all(cacheNames.map(function (cacheName) {
                    return caches.delete(cacheName);
                }))
            });
            break;
    }
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            // 来来来，代理可以搞一些代理的事情
            // 如果 Service Worker 有自己的返回，就直接返回，减少一次 http 请求
            if (response) {
                return response;
            }

            // 如果 service worker 没有返回，那就得直接请求真实远程服务
            var request = event.request.clone(); // 把原始请求拷过来
            return fetch(request).then(function (httpRes) {
                // http请求的返回已被抓到，可以处置了。

                // 请求失败了，直接返回失败的结果就好了。。
                if (!httpRes || httpRes.status !== 200) {
                    return httpRes;
                }
                var url = request.url.replace(location.origin,"");

                if(url.indexOf("/sw.js") >= 0)
                    return httpRes;

                if(url.indexOf("/login") >= 0)
                {
                    caches.keys().then(function (cacheNames) {
                        return Promise.all(cacheNames.map(function (cacheName) {
                            return caches.delete(cacheName);
                        }))
                    })
                }

                // 请求成功的话，将请求缓存起来。 不缓存网页，网页目前是静态化
                if(
                    (!httpRes.headers.get('Content-type').match(/html/) && !httpRes.headers.get('Content-type').match(/json/))
                    || (request.method === "GET" && cache_page.indexOf(url) >= 0)
                )
                {
                    var responseClone = httpRes.clone();
                    caches.open(cache_var).then(function (cache) {
                        cache.put(event.request, responseClone);
                    });
                }

                return httpRes;
            });
        })
    );
});

self.addEventListener("activate",function (event) {
    event.waitUntil(caches.keys().then(function (cacheNames) {
        return Promise.all(cacheNames.map(function (cacheName) {
            if(cacheName !== cache_var)
                return caches.delete(cacheName);
        }))
    }))
});