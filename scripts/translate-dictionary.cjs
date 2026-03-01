const fs = require('fs');
const path = require('path');

const dictionary = {
    // bellman-ford
    "指定した始点から終点への最短距離を求める. 負の辺でもOK. 負の閉路を検出可能.": "Finds the shortest distance from a specified starting point to the destination. Negative edges are supported. Negative cycles can be detected.",
    "`res.path`でsからeへの最短パスを得る.  ": "Get the shortest path from s to e using `res.path`.  ",
    "`res.distances`でｓから各頂点への最短距離を得る. 経路が存在しなければINF.  ": "Get the shortest distance from s to each vertex using `res.distances`. If no path exists, it returns INF.  ",
    "`res.hascycle`でgに負の閉路があるかを得る.": "Check if a negative cycle exists in g using `res.hascycle`.",
    // big-int
    "多倍長整数.": "Arbitrary-precision integer (BigInt).",
    "`a.to_string()`で`std::string`に変換された数値を得る.": "Get the number converted to `std::string` using `a.to_string()`.",
    // binary-exponentiation
    "$a^n \\ \\ (\\text{mod}\\ \\ mod)$を$O(\\log(n))$で求める.": "Calculates $a^n \\ \\ (\\text{mod}\\ \\ mod)$ in $O(\\log(n))$.",
    "`mop(a,b,mod)`で$a^n \\ \\ (\\text{mod}\\ \\ mod)$が返る.": "`mop(a,b,mod)` returns $a^n \\ \\ (\\text{mod}\\ \\ mod)$.",
    // binary-search
    "二分探索する.": "Performs binary search.",
    "`dichotomy(探索下限, 探索上限, λ:int -> boolのlambda)`でλがtrueになる最小の数が返される. 探索範囲は半開区間で渡し, 区間にλがtrueになるものがなかった場合は探索上限値を返す.": "`dichotomy(lower_bound, upper_bound, λ:int -> bool lambda)` returns the minimum number for which λ is true. The search range is passed as a half-open interval, and if no evaluation is true within the interval, the upper bound is returned.",
    "例えば": "For example",
    "の返り値は$ 50 < n $を満たす最小のnで51が返される.": "returns 51, which is the minimum n satisfying $ 50 < n $.",
    // chmaxchmin
    "`chmax(a,b)`で`a=max(a,b)`の更新をする. 更新があった場合はtrueを返す. `chmin`も同様:": "Updates `a=max(a,b)` using `chmax(a,b)`. Returns true if an update occurred. `chmin` works similarly:",
    // conv-index
    "`ConvIndex2.conv(y,x)`で$(x,y)$を一次元のインデックスに変換する.": "Converts $(x,y)$ to a 1D index using `ConvIndex2.conv(y,x)`.",
    "`ConvIndex3.conv(z,y,x)`で$(x,y,z)$を一次元のインデックスに変換する.": "Converts $(x,y,z)$ to a 1D index using `ConvIndex3.conv(z,y,x)`.",
    // conv-notation
    "n進数からm進数に変換": "Converts from base-n to base-m",
    // cumulate
    "累積和を取り, 連続部分, 矩形, 長方形状の和を$O(1)$で求める.": "Calculates the prefix sum to find the sum of continuous segments, rectangles, or cuboids in $O(1)$.",
    "構築:": "Initialization:",
    "クエリ:": "Query:",
    "### 初期化": "### Initialization",
    "### クエリ": "### Query",
    "`vector`はvector, `matrix`は`vector<vector>`, `tensor`は`vector<vector<vector>>`.": "`vector` is vector, `matrix` is `vector<vector>`, `tensor` is `vector<vector<vector>>`.",
    "c1であれば区間$[x1,x2)$の和を返す.": "returns the sum of the interval $[x1,x2)$ for c1.",
    // dijkstra
    "指定した頂点から他全てへの頂点への最短距離を求める. 負の辺が無いことを前提とする.": "Finds the shortest distance from a specified vertex to all other vertices. Assumes no negative edges.",
    "`res[i]`で頂点sから頂点iの最短距離を得る.": "Get the shortest distance from vertex s to vertex i using `res[i]`.",
    // divisor-enumeration
    "与えられた自然数の約数を列挙する.": "Enumerates the divisors of a given natural number.",
    "例えば`divisor(12)`をすると, `vector<int>{1,2,3,4,6,12}`が返ってくる. 昇順であることが保証される.": "For example, calling `divisor(12)` returns `vector<int>{1,2,3,4,6,12}`. It is guaranteed to be in ascending order.",
    // eulers-totient-function
    "オイラーのトーシェント関数. $ n \\in \\mathbb{N} $に対して, $n$と互いに素である$1$以上$n$以下の自然数の個数$φ(n)$を与える.  ": "Euler's totient function. For $ n \\in \\mathbb{N} $, it gives $φ(n)$, the number of natural numbers up to $n$ that are coprime to $n$.  ",
    "nの素因数分解が": "When the prime factorization of n is expressed as",
    "と表されるとき,": ",",
    "と変形できることを利用して計算する。": "we calculate using this transformation.",
    // fast-io
    "cin/coutはC由来のstdioと出力する順番が実行順と異ならないように勝手にバッファをフラッシュするので, これを無効化する.ついでに小数点以下16ケタまで出力するようにした.  ": "cin/cout automatically flushes the buffer to ensure the execution order matches C-style stdio output. This disables that behavior. It also configures output precision to 16 decimal places.  ",
    "`main()`の中に書きたくないので, 構造体のコンストラクタとして呼び出すとこれを回避できるテクを使う:": "To avoid writing it inside `main()`, we use a technique of calling it as a struct constructor:",
    // get-farthest-vertex
    "木において指定した頂点からもっとも遠い頂点を得る.": "Finds the farthest vertex from a specified vertex in a tree.",
    "`res.v`で最も遠い頂点の頂点番号を得る. `res.cost`で最も遠い頂点までの距離を得る.": "Get the index of the farthest vertex using `res.v`. Get the distance to the farthest vertex using `res.cost`.",
    // get-graph-diameter
    "`res.cost`で直径を得る. `res.u`, `res.v`で直径を結ぶ頂点を得る.": "Get the diameter using `res.cost`. Get the vertices forming the diameter using `res.u` and `res.v`.",
    // kruskal
    "最小全域木を求める.": "Finds the Minimum Spanning Tree.",
    "`res`に最小全域木の[UndirectedGraph](/en/blog/romophic-library/lib/undirected-graph)を得る.": "`res` will contain the Minimum Spanning Tree as an [UndirectedGraph](/en/blog/romophic-library/lib/undirected-graph).",
    // lazy-segment-tree
    "[SegmentTree](/en/blog/romophic-library/lib/segment-tree)の一点更新を区間更新として$O(\\log n)$で行う.": "Performs point updates of a [SegmentTree](/en/blog/romophic-library/lib/segment-tree) as range updates in $O(\\log n)$.",
    "初期化: $O(n)$  ": "Initialization: $O(n)$  ",
    "初期化: $O(n)$": "Initialization: $O(n)$",
    "クエリ: $\\log(n)$": "Query: $\\log(n)$",
    "### 構築&更新": "### Build & Update",
    "LazySegmentTree<class> lseg(配列長, 二項演算するlambda, 単位元);": "LazySegmentTree<class> lseg(array_length, lambda_for_binary_operation, identity_element);",
    "で$ [a,b) $をxで更新する.": "updates $ [a,b) $ with x.",
    "で半開区間$ \\left[ a,b \\right) $に演算を適応した値が得られる.": "returns the evaluated binary operation over the half-open interval $ \\left[ a,b \\right) $.",
    "例として区間和を求める場合、`update(a,b,x)`の動作を": "For example, when finding the range sum, the behavior of `update(a,b,x)` differs:",
    "- 区間更新: $ \\text{seg}\\_i \\rightarrow x$": "- Range update: $ \\text{seg}\\_i \\rightarrow x$",
    "- 区間加算: $ \\text{seg}\\_i \\rightarrow \\text{seg}\\_i + x $": "- Range addition: $ \\text{seg}\\_i \\rightarrow \\text{seg}\\_i + x $",
    "にするかで実装が異なる": "depending on whether it is an update or an addition.",
    "### 区間更新型ver": "### Range Update Version",
    "### 区間加算型ver": "### Range Add Version",
    "## 例": "## Example",
    "連続区間の和を高速に求めたいとして:": "To quickly compute the sum of a continuous interval:",
    "の様にlambdaをおけばよい.": "you just need to provide a lambda like this.",
    "// ~構築~": "// ~build~",
    // mo
    "オフラインクエリかつクエリ区間の伸縮が簡単に出来る時高速に処理する.": "Fast processing for offline queries when expanding and shrinking query intervals is easy.",
    // modint
    "自動でModを取る": "Automatically takes modulo",
    "## 宣言": "## Declaration",
    // next-char-index
    "文字列の`i`th以降で文字cが出現する最小のindexを返す. 存在しなければ文字列長を返す.": "Returns the minimum index where character c appears at or after the `i`-th character of the string. Returns the string length if it doesn't exist.",
    "`s`は`std::string`, `res[i][j]`で`i`th以降(`i`thも含む)で文字`c`が出現するindexを得る.": "`s` is a `std::string`. Use `res[i][j]` to get the index where character `c` appears at or after the `i`-th character (inclusive).",
    // prime-factorization
    "与えられた自然数を素因数分解する.": "Computes the prime factorization of a given natural number.",
    "例えば`primeFactrize(12)`をすると, `{(2,2),(3,1)}`が返ってくる.これは$ 2^2": "For example, `primeFactorize(12)` returns `{(2,2),(3,1)}`. This means $ 2^2",
    "3^1 = 12 $を意味している.": "3^1 = 12 $.",
    // rolling-hash
    "文字列が一致しているかの判定を定数時間で行う. ロリハ.": "Checks if strings match in constant time. Rolling Hash.",
    "構築: $ O(n) $  ": "Initialization: $ O(n) $  ",
    "構築: $ O(N \\log N) $  ": "Initialization: $ O(N \\log N) $  ",
    "クエリ: $ O(1) $": "Query: $ O(1) $",
    "クエリ: $ O(M \\log N) $": "Query: $ O(M \\log N) $",
    "### 構築": "### Initialization",
    "### ハッシュ": "### Hash",
    "$[l,r)$のハッシュを得る.": "Get the hash for $[l,r)$.",
    // scc
    "強連結成分分解をする. 巡回可能な部分ごとにグラフを分けてまとめ, それらのDAGを作る.": "Performs Strongly Connected Components (SCC) decomposition. It partitions and groups the graph into cyclable components, and creates a DAG of those components.",
    "![イメージ](scc-scs.png)  ": "![Image](scc-scs.png)  ",
    "上図においてグループ0とグループ1内ではそれぞれ互いに移動可能であり, またグループ間の移動についてグループ0からグループ1のみに移動可能である. 感覚的にはグラフの圧縮.": "In the figure above, movement is mutually possible within group 0 and group 1 respectively, and movement between groups is only possible from group 0 to group 1. Intuitively, it is graph compression.",
    "gは`vector<vector<int>>`.  ": "g is a `vector<vector<int>>`.  ",
    "`res.indexToContracted[i]`で頂点iが属する強連結成分のindexを得る.  ": "Get the index of the strongly connected component to which vertex i belongs using `res.indexToContracted[i]`.  ",
    "`res.contractedGraph`で強連結成分ごとにまとめられたグラフを得る(`vector<vector<int>>`).": "Get the graph grouped by strongly connected components using `res.contractedGraph` (`vector<vector<int>>`).",
    "[Example](#example)での実行結果は:": "The execution result for [Example](#example) is:",
    "となる.": ".",
    "## Depends": "## Depends",
    // segment-tree
    "**交換則**と**結合則**を満たし、**単位元**を持つ演算と配列に対して、連続する部分範囲に対する演算結果を高速に計算する.  ": "For operators and arrays satisfying **commutativity** and **associativity** and having an **identity element**, it quickly computes the operation result of a continuous sub-range.  ",
    "実数の加法はAbel群であるから上記の性質を満たす. 具体的には:": "Addition of real numbers forms an Abelian group, so it satisfies the above properties. Specifically:",
    "- 交換則: $ a + b = b + a $": "- Commutativity: $ a + b = b + a $",
    "- 結合則: $ (a+b)+c = a+(b+c) $": "- Associativity: $ (a+b)+c = a+(b+c) $",
    "- 単位元の存在: $ a + 0 = a $": "- Existence of identity element: $ a + 0 = a $",
    "を満たすから, これはセグ木に乗せられ, 連続する部分範囲の和を高速に求めることができる.  ": "Since it satisfies these, it can be loaded onto a Segment Tree to quickly compute the sum of continuous sub-ranges.  ",
    "類似データ構造: [LazySegmentTree](/en/blog/romophic-library/lib/lazy-segment-tree)": "Similar data structure: [LazySegmentTree](/en/blog/romophic-library/lib/lazy-segment-tree)",
    "でi番目にxを代入できる.  ": "assigns x to the i-th element.  ",
    "配列を構築後": "After array construction,",
    "でセグ木を構築する.": "builds the segment tree.",
    "### 更新": "### Update",
    "構築後,": "After construction,",
    "でi番目にxを代入と構築ができる.": "updates the i-th element to x and rebuilds.",
    "SegmentTree<class> seg(配列長, 二項演算するlambda, 単位元);": "SegmentTree<class> seg(array_length, lambda_for_binary_operation, identity_element);",
    // simulated-annealing
    "$ f: D \\rightarrow \\mathbb{R} $の返り値が定義域$ D $で最大になるような$x \\in D$を求める. 焼きなまし法です.": "Find an $x \\in D$ such that the return value of $f: D \\rightarrow \\mathbb{R}$ is maximized in the domain $D$. This is Simulated Annealing.",
    "struct State{ // 状態を表す構造体": "struct State{ // Structure representing the state",
    "  // f(x) = -x^4 + x^3 + x^2 + x": "  // f(x) = -x^4 + x^3 + x^2 + x",
    "  // max f(x): 2.33.... (x = 1.28...)": "  // max f(x): 2.33.... (x = 1.28...)",
    "  double eval(){ // 評価関数": "  double eval(){ // Evaluation function",
    "  void modify(){ // 遷移": "  void modify(){ // State transition",
    "// sa内のStateの初期設定をする": "// Initialize the state inside sa",
    "`State`の中身を目的に応じて書き換えてください": "Please rewrite the contents of `State` according to your purpose.",
    "### Hyperparameterの設定 & 焼なます": "### Hyperparameter Setup & Annealing",
    "// (epoch当たりの試行回数, 初期温度, 目標温度, 冷却係数)": "// (trials per epoch, initial temperature, target temperature, cooling coefficient)",
    "### 結果の参照": "### Result Reference",
    "// 結果はクラス内のstateで参照できる": "// The result can be referenced by 'state' in the class",
    // suffix-array
    "高速な文字列検索を行う. イメージはgrep.": "Performs fast string search. Conceptually similar to grep.",
    "### 検索": "### Search",
    "一致部分として`[res.first,res.second)`が得られる.": "The matching part is obtained as `[res.first, res.second)`.",
    // topological-sort
    "有向非巡回グラフ(DAG)の頂点を線形順序に並べる.": "Orders the vertices of a Directed Acyclic Graph (DAG) in a linear sequence.",
    "`res`で線形順序に並べられた頂点を得る.": "Get the vertices in a linear sequence using `res`.",
    // undirected-graph
    "重み付き無向グラフを扱う.": "Handles weighted undirected graphs.",
    "### 重み付き無向パスの追加": "### Add weighted undirected edge",
    "g.add(頂点, 頂点, 重み);": "g.add(vertex, vertex, weight);",
    // union-find
    "要素がどの集合に属しているかを判定し,部分集合の濃度や部分集合の集合を得る.": "Determines which set elements belong to, and obtains the sizes of subsets and sets of subsets.",
    "$ O(\\alpha(n)) $, $\\alpha$はAckermann関数の逆関数": "$ O(\\alpha(n)) $, where $\\alpha$ is the inverse Ackermann function.",
    "#### マージ": "#### Merge",
    "aが属する集合と,bが属する集合をマージする": "Merges the set that a belongs to with the set that b belongs to.",
    "#### 同一の集合か判定": "#### Determine if in the same set",
    "a,bが同一の集合に属しているか判定する": "Determines whether a and b belong to the same set.",
    "#### 集合サイズ": "#### Set Size",
    "aが属する集合の濃度を返す": "Returns the size of the set to which a belongs.",
    "#### 部分集合の集合": "#### Set of Subsets",
    "で`vector{部分集合0, 部分集合1, ...}`を得る.": "returns `vector{subset 0, subset 1, ...}`.",
    // warshall-floyd
    "重み付き有向グラフの全頂点ペアの最短距離を求める. 負の閉路が無いことを前提とする.": "Finds the shortest distances between all pairs of vertices in a weighted directed graph. Assumes no negative cycles.",
    "`res.dist[s][e]`で頂点sからeの距離, `res.next[s][e]`で頂点sからeへ最短で到達するために次に到達すべき頂点を得る.": "Get the distance from vertex s to e using `res.dist[s][e]`. Get the next vertex to visit to reach e from s via the shortest path using `res.next[s][e]`.",
    // weighted-union-find
    "UnionFindに重みを持たせて要素間の距離も管理できるようにしたもの.": "A Union-Find with weights to manage distances between elements.",
    "WeightedUnionFind<距離を表すclass> wuf(要素数);": "WeightedUnionFind<distance_class> wuf(num_elements);",
    "aが属する集合と,bが属する集合をbの重み-aの重み = w、つまりaよりbの方がw重みがあるようにマージする.": "Merges the set containing a and the set containing b such that (weight of b) - (weight of a) = w, meaning b is heavier than a by w.",
    "#### 重みの差": "#### Difference in Weight",
    "でbの重み-aの重みを得る.": "returns (weight of b) - (weight of a).",
};

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

walkDir('src/content/blog', (filePath) => {
    if (filePath.endsWith('.en.mdx')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let original = content;

        // Sort keys by length descending so longer phrases get replaced first
        const keys = Object.keys(dictionary).sort((a, b) => b.length - a.length);

        keys.forEach(k => {
            // Escape for regex or simple split/join
            content = content.split(k).join(dictionary[k]);
        });

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`Translated remaining strings in: ${filePath}`);
        }
    }
});
