/*
    The MIT License
    Copyright (c) 2011 Mike Chambers
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/

/*
change to es6 class
*/

class QuadTree {
  constructor(bounds, pointQuad, maxDepth, maxChildren) {

  }
}


class Node {
  nodes = null;
  children = null;
  _bounds = null;
  _depth = 0;
  _maxChildren = 4;
  _maxDepth = 4;
  _classConstructor = Node;

  static TOP_LEFT = 0;
  static TOP_RIGHT = 1;
  static BOTTOM_LEFT = 2;
  static BOTTOM_RIGHT = 3;


  constructor(bounds, depth, maxDepth, maxChildren) {
    this._bounds = bounds;
  	this.children = [];
  	this.nodes = [];

    if (maxChildren) {
  		this._maxChildren = maxChildren;
  	}
  	if (maxDepth) {
  		this._maxDepth = maxDepth;
  	}

  	if (depth)	{
  		this._depth = depth;
  	}
  }

  insert = (item) => {
    if (this.nodes.length) {
      const index = this._findIndex(item);
      this.nodes[index].insert(item);
      return;
    }
    this.children.push(item);

    const len = this.children.length;
    if (!(this._depth >= this._maxDepth) && len > this._maxChildren) {
      this.subdivide();

      // TODO
      for(var i = 0; i < len; i++)
      {
          this.insert(this.children[i]);
      }
      this.children.length = 0;
    }
  }

  retrieve = (item) => {
    if (this.nodes.length) {
      const index = this._findIndex(item);
      return this.nodes[index].retrieve(item);
    }
    return this.children;
  }

  retrieveInBounds = (bounds) => {
    var result = [];

    if( this.collidesWith(bounds)) {
      result = result.concat(this._stuckChildren);

      if (this.children.length) {
          result = result.concat(this.children);
      } else {
        if (this.nodes.length) {
          for (var i = 0; i < this.nodes.length; i++) {
              result = result.concat(this.nodes[i].retrieveInBounds(bounds));
          }
        }
      }
    }
    return result;
  }

  collidesWith = (bounds) => {
    var b1 = this._bounds;
    var b2 = bounds;

    return !(
         b1.x > (b2.x + b2.width)  ||
         b2.x > (b1.x + b1.width)  ||
         b1.y > (b2.y + b2.height) ||
         b2.y > (b1.y + b1.height)
    );
  }

  _findIndex = (item) => {
    var b = this._bounds;
    var left = (item.x > b.x + b.width / 2)? false : true;
    var top = (item.y > b.y + b.height / 2)? false : true;

    //top left
    var index = Node.TOP_LEFT;
    if (left) {
      //left side
      if (!top) {
        //bottom left
        index = Node.BOTTOM_LEFT;
      }
    } else {
      //right side
      if (top) {
        //top right
        index = Node.TOP_RIGHT;
      } else {
        //bottom right
        index = Node.BOTTOM_RIGHT;
      }
    }
    return index;
  }

  subdivide = () => {
    var depth = this._depth + 1;
    var bx = this._bounds.x;
    var by = this._bounds.y;

    //floor the values
    var b_w_h = (this._bounds.width / 2)|0;
    var b_h_h = (this._bounds.height / 2)|0;
    var bx_b_w_h = bx + b_w_h;
    var by_b_h_h = by + b_h_h;

    //top left
    this.nodes[Node.TOP_LEFT] = new this._classConstructor({
     x:bx,
     y:by,
     width:b_w_h,
     height:b_h_h
    },
    depth, this._maxDepth, this._maxChildren);

    //top right
    this.nodes[Node.TOP_RIGHT] = new this._classConstructor({
     x:bx_b_w_h,
     y:by,
     width:b_w_h,
     height:b_h_h
    },
    depth, this._maxDepth, this._maxChildren);

    //bottom left
    this.nodes[Node.BOTTOM_LEFT] = new this._classConstructor({
     x:bx,
     y:by_b_h_h,
     width:b_w_h,
     height:b_h_h
    },
    depth, this._maxDepth, this._maxChildren);


    //bottom right
    this.nodes[Node.BOTTOM_RIGHT] = new this._classConstructor({
     x:bx_b_w_h,
     y:by_b_h_h,
     width:b_w_h,
     height:b_h_h
    },
    depth, this._maxDepth, this._maxChildren);
  }

  clear = () => {
    this.children.length = 0;
    var len = this.nodes.length;
    for(var i = 0; i < len; i++) {
        this.nodes[i].clear();
    }

    this.nodes.length = 0;
  }
}

export default Node;
