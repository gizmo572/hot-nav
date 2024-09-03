# HOT NAV

Hot-Nav is an accessibility library for adding hotkey functionality to Next.js applications.

## Instructions

Install the hot-nav package in the root of your application:

```js
npm install hot-nav
```

Import the HotNavProvider component in the root file of your Next.js application and wrap the root of your application in this component:

```ts
import { HotNavigationProvider } from 'hot-nav';

export const metadata = {
  title: 'My NextJS App',
  description: 'This app is uber accessible and amazing thanks to HotNav!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <HotNavigationProvider>
        <body>{children}</body>
      </HotNavigationProvider>
    </html>
  );
}
```

Wrap any clickable component you wish in the HotLink component. As you can see, onClick functionality is also supported:

```ts
import { HotLink } from "hot-nav";


const SomeReactComponent = () => {
  return (
    <>
      <HotLink>
        <a href="/infinity">TO INFINITY</a>
      </HotLink>
      <HotLink>
        <button onClick={() => alert('HOTNAV IS BEYOND AWESOME!!')}>AND BEYOND</button>
      </HotLink>
    </>
  )
}
```

The HotLink component can also function independently as a standalone clickable component:

```ts
const SomeReactComponent = () => {
  return (
    <>
      <HotLink href="/infinity">TO INFINITY</HotLink>
      <HotLink onClick={() => alert('HOTNAV IS BEYOND AWESOME!!')}>AND BEYOND</HotLink>
    </>
  )
}
```

Class components are also supported!:

```ts
'use client'

import React from 'react';
import { HotLink } from 'hot-nav';

class ClassyLink extends React.Component {
  render() {
    return <a href='/stayClassy'>{this.props.children}</a>;
  }
}

export default class SomeMythicalComponent extends React.Component {
  render() {
    return (
      <HotLink>
        <ClassyLink>BACK TO THE FUTURE</ClassyLink>
      </HotLink>
    )
  }
}
```

As you can see, the HotLink component is able to access a nested href attribute. This will work for any level of nesting, both for elements that are *returned* by wrapper components like ClassyLink, and for elements that are *children* of a component HotLink is wrapping, as you can see in this extreme example here:

```ts
<HotLink>
  <div>
    <div>
      <div>
        <div>
          <button onClick={() => alert('WHAT ABOUT MEEEE!!!')}>
            <div>
              <div>
                <div>
                  <a href='/extreme'>This Seems Unreasonable...</a>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</HotLink>
```

Now that was extreme! And what in the heck was that button element doing there? Well, as it turns out, HotLink will register both the onClick event, and the nested route to '/extreme'. Pretty cool! However, let's say these elements were to both have 'href' attributes. In this case, the 'href' of the most senior element will take precedence, and the more nested 'href' will be ignored, as is demonstrated below:

```ts
<HotLink>
  <button href='/darthbutton' onClick={() => alert("ANCHOR, I AM YOUR FATHER!")}>
    <a href='/noooooobu'>NOOOOOOOOOO!!!!!!</a>
  </button>
</HotLink>
```

