+++
title = 'STLデータ構造をistream,ostream-compatibleにする'
date = 2024-06-09T22:01:37+09:00
description = "Guide to making STL data structures istream/ostream-compatible"
categories = [
  "c++",
  "competitive programming"
]
+++
# tldr

下の[Source](#source)をコピペすると C++ で vector や tuple などをそのまま cin や cout できます。

-------

- `std::vector`
- `std::deque`
- `std::list`
- `std::pair`
- `std::tuple`
- `std::map`
- `std::multimap`
- `std::unordered_map`
- `std::unordered_multimap`
- `std::set`
- `std::multiset`
- `std::unordered_set`
- `std::unordered_multiset`

のシフト演算子をオーバーロードする
再帰的に構造体を展開し、例えば`vector<pair<int,int>>`などその要素数に合わせて入力,出力処理ができる

# Examples

```cpp
vector<pair<int,int>> a(3);
cin>>a; // <- 1 2 3 4 5 6
cout<<a<<endl; // -> [(1, 2), (3, 4), (5, 6)]
```

#

```cpp
vector<pair<string,tuple<int,int,int>>> a(2);
cin>>a; // <- abcd 1 2 3 efgh 4 5 6
cout<<a<<endl; // -> [(abcd, (1, 2, 3)), (efgh, (4, 5, 6))]
```

# Source

```cpp
template <class T>
ostream &operator<<(ostream &_ostr, const vector<T> &_v);
template <class T>
ostream &operator<<(ostream &_ostr, const deque<T> &_v);
template <class T>
ostream &operator<<(ostream &_ostr, const list<T> &_v);
template <class T, class Y>
ostream &operator<<(ostream &_ostr, const pair<T, Y> &_v);
template <class... Ts>
ostream &operator<<(ostream &_ostr, const tuple<Ts...> &t);
template <class T, class Y>
ostream &operator<<(ostream &_ostr, const map<T, Y> &_v);
template <class T, class Y>
ostream &operator<<(ostream &_ostr, const multimap<T, Y> &_v);
template <class T, class Y>
ostream &operator<<(ostream &_ostr, const unordered_map<T, Y> &_v);
template <class T, class Y>
ostream &operator<<(ostream &_ostr, const unordered_multimap<T, Y> &_v);
template <class T>
ostream &operator<<(ostream &_ostr, const set<T> &_v);
template <class T>
ostream &operator<<(ostream &_ostr, const multiset<T> &_v);
template <class T>
ostream &operator<<(ostream &_ostr, const unordered_set<T> &_v);
template <class T>
ostream &operator<<(ostream &_ostr, const unordered_multiset<T> &_v);
template <class T>
ostream &_orange(ostream &_ostr, const T &_v) {
  _ostr << "[";
  for (bool tr = true; auto &i : _v)
    _ostr << (tr ? tr = false, "" : ", ") << i;
  return _ostr << "]";
}
template <class T>
ostream &operator<<(ostream &_ostr, const vector<T> &_v) { return _orange(_ostr, _v); }
template <class T>
ostream &operator<<(ostream &_ostr, const deque<T> &_v) { return _orange(_ostr, _v); }
template <class T>
ostream &operator<<(ostream &_ostr, const list<T> &_v) { return _orange(_ostr, _v); }
template <class T, class Y>
ostream &operator<<(ostream &_ostr, const pair<T, Y> &_v) { return _ostr << "(" << _v.first << ", " << _v.second << ")"; }
template <class... Ts>
ostream &operator<<(ostream &_ostr, const tuple<Ts...> &_v) {
  bool tr = true;
  _ostr << "(";
  apply([&_ostr, &tr](auto &&...args) {
    auto print = [&](auto &&val) {
      if (!tr)
        _ostr << ", ";
      _ostr << val;
      tr = false;
    };
    (print(args), ...);
  },
        _v);
  return _ostr << ")";
}
template <class T, class Y>
ostream &operator<<(ostream &_ostr, const map<T, Y> &_v) { return _orange(_ostr, _v); }
template <class T, class Y>
ostream &operator<<(ostream &_ostr, const multimap<T, Y> &_v) { return _orange(_ostr, _v); }
template <class T, class Y>
ostream &operator<<(ostream &_ostr, const unordered_map<T, Y> &_v) { return _orange(_ostr, _v); }
template <class T>
ostream &operator<<(ostream &_ostr, const set<T> &_v) { return _orange(_ostr, _v); }
template <class T>
ostream &operator<<(ostream &_ostr, const multiset<T> &_v) { return _orange(_ostr, _v); }
template <class T>
ostream &operator<<(ostream &_ostr, const unordered_set<T> &_v) { return _orange(_ostr, _v); }
template <class T>
ostream &operator<<(ostream &_ostr, const unordered_multiset<T> &_v) { return _orange(_ostr, _v); }
template <class T>
istream &operator>>(istream &_istr, vector<T> &_v);
template <class T>
istream &operator>>(istream &_istr, deque<T> &_v);
template <class T, class Y>
istream &operator>>(istream &_istr, pair<T, Y> &_v);
template <class T>
istream &_irange(istream &_istr, T &_v) {
  for (auto &i : _v)
    _istr >> i;
  return _istr;
}
template <class T>
istream &operator>>(istream &_istr, vector<T> &_v) { return _irange(_istr, _v); }
template <class T>
istream &operator>>(istream &_istr, deque<T> &_v) { return _irange(_istr, _v); }
template <class T, class Y>
istream &operator>>(istream &_istr, pair<T, Y> &_v) { return _istr >> _v.first >> _v.second; }
```

<https://github.com/romophic/stldumper/blob/main/stldumper.hpp>
