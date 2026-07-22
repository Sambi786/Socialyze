const fs = require('fs');
const file = 'src/components/SocialyzeFeed.tsx';
let content = fs.readFileSync(file, 'utf8');

// The original closing tags before </React.Fragment> were:
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           </React.Fragment>

content = content.replace(
  /                  <\/div>\n                <\/div>\n              <\/div>\n            <\/div>\n          <\/div>\n          <\/React\.Fragment>/,
  `                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
          </React.Fragment>`
);

fs.writeFileSync(file, content);
console.log("Updated feed closing tags");
