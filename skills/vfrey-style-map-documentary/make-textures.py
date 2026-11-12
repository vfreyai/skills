# Tileable paper / sea / grain textures for the map-documentary style. Pure python, no downloads. Deterministic.
import zlib, struct, random, math, sys
def png(path, w, h, rows, mode):  # mode 2 = RGB, 6 = RGBA
    raw = b''.join(b'\x00' + bytes(r) for r in rows)
    def ch(t, d): c = struct.pack('>I', len(d)) + t + d; return c + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    open(path, 'wb').write(b'\x89PNG\r\n\x1a\n' + ch(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, mode, 0, 0, 0)) + ch(b'IDAT', zlib.compress(raw, 9)) + ch(b'IEND', b''))
def noise_grid(n, seed):
    r = random.Random(seed); return [[r.random() for _ in range(n)] for _ in range(n)]
def vnoise(g, n, x, y):  # periodic smooth value noise, x,y in [0,1)
    x *= n; y *= n; xi = int(x) % n; yi = int(y) % n; xf = x - int(x); yf = y - int(y)
    sx = xf * xf * (3 - 2 * xf); sy = yf * yf * (3 - 2 * yf)
    a = g[yi][xi]; b = g[yi][(xi + 1) % n]; c = g[(yi + 1) % n][xi]; d = g[(yi + 1) % n][(xi + 1) % n]
    return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy
def fbm(grids, x, y):
    s = 0; amp = 1; tot = 0
    for g, n in grids: s += amp * vnoise(g, n, x, y); tot += amp; amp *= 0.5
    return s / tot
def tile(size, seed, base, var, fibres):
    grids = [(noise_grid(n, seed + n), n) for n in (4, 8, 16, 32, 64)]
    r = random.Random(seed); fib = [[0.0] * size for _ in range(size)]
    for _ in range(fibres):  # short fibres, wrap around
        x = r.random() * size; y = r.random() * size; a = r.random() * math.pi; l = 6 + r.random() * 14; v = (r.random() - 0.5) * 0.5
        for k in range(int(l)): fib[int(y + math.sin(a) * k) % size][int(x + math.cos(a) * k) % size] += v
    rows = []
    for j in range(size):
        row = []
        for i in range(size):
            f = fbm(grids, i / size, j / size) - 0.5; f2 = fib[j][i]
            row += [max(0, min(255, int(base[c] + var[c] * (f * 2 + f2 * 0.6)))) for c in range(3)]
        rows.append(row)
    return rows
out = (sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else sys.argv[1] if len(sys.argv) > 1 else '.').rstrip('/')
S = 384
png(out + '/paper.png', S, S, tile(S, 11, (214, 193, 148), (46, 42, 34), 2600), 2)
png(out + '/sea.png', S, S, tile(S, 29, (13, 36, 62), (14, 22, 30), 900), 2)
r = random.Random(5); G = 256
png(out + '/grain.png', G, G, [[v for _ in range(1) for v in (255, 255, 255, int(r.random() ** 2 * 60)) for _ in [0]] if False else sum([[255, 255, 255, int(r.random() ** 3 * 90)] for _ in range(G)], []) for _ in range(G)], 6)
