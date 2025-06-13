import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '@/lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const sortBy = searchParams.get('sortBy') || 'recent';
    const searchTerm = searchParams.get('search') || '';
    const limitCount = parseInt(searchParams.get('limit') || '20');

    let postsQuery: any = db.collection('posts');

    // Only apply one filter at a time to avoid composite index requirements
    if (tags.length > 0) {
      postsQuery = postsQuery.where('tags', 'array-contains-any', tags);
    } else if (searchTerm) {
      postsQuery = postsQuery.where('title', '>=', searchTerm).where('title', '<=', searchTerm + '\uf8ff');
    } else {
      // If no filters, we can safely order by createdAt
      postsQuery = postsQuery.orderBy('createdAt', 'desc');
    }

    postsQuery = postsQuery.limit(limitCount);

    const snapshot = await postsQuery.get();
    const posts = await Promise.all(
      snapshot.docs.map(async (docSnapshot: any) => {
        const data = docSnapshot.data();
        let linkedProduct = null;

        // Fetch linked product details if exists
        if (data.linkedProductId) {
          try {
            const productDoc = await db.collection('products').doc(data.linkedProductId).get();
            if (productDoc.exists) {
              const productData = productDoc.data();
              linkedProduct = {
                id: data.linkedProductId, // Use the document ID instead of productData.id
                name: productData?.productName,
                imageUrl: productData?.imageUrl,
              };
            }
          } catch (error) {
            console.error('Error fetching linked product:', error);
          }
        }

        return {
          id: docSnapshot.id,
          ...data,
          linkedProduct,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        };
      })
    );

    // Sort in JavaScript if we have filters applied or need specific sorting
    if (tags.length > 0 || searchTerm) {
      posts.sort((a: any, b: any) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return bTime - aTime; // desc order
      });
    }

    // Sort by popularity if requested (after fetching likes/dislikes)
    if (sortBy === 'popular') {
      posts.sort((a: any, b: any) => {
        const aScore = (a.likes?.length || 0) - (a.dislikes?.length || 0);
        const bScore = (b.likes?.length || 0) - (b.dislikes?.length || 0);
        return bScore - aScore;
      });
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, authorId, authorName, tags, linkedProductId } = body;

    if (!title || !content || !authorId || !authorName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const postData = {
      title,
      content,
      authorId,
      authorName,
      tags: tags || [],
      linkedProductId: linkedProductId || null,
      likes: [],
      dislikes: [],
      commentCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('posts').add(postData);

    return NextResponse.json({ id: docRef.id, ...postData }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
